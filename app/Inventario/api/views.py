from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Sum
from datetime import datetime, timedelta

from ..models import (
    Operario, Administrador, Ecoladrillo, Material,
    RegistroEcoladrillo, RetiroEcoladrillo, RegistroMaterial, Reporte,
    ReporteStockFecha, ReporteResumenInventario, ReporteResumenRetiros
)
from .serializers import (
    OperarioSerializer, AdministradorSerializer, EcoladrilloSerializer,
    MaterialSerializer, RegistroEcoladrilloSerializer, RetiroEcoladrilloSerializer,
    RegistroMaterialSerializer, ReporteSerializer, ReporteStockFechaSerializer,
    ReporteResumenInventarioSerializer, ReporteResumenRetirosSerializer
)
from .exceptions import format_validation_errors

class BaseViewSet(viewsets.ModelViewSet):
    """ViewSet base con manejo consistente de errores"""
    
    def create(self, request, *args, **kwargs):
        """Crear objeto con manejo de errores estandarizado"""
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            # Formatear errores de validación
            errores = format_validation_errors(serializer.errors)
            return Response({'errores': errores}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Intentar guardar el objeto
            instance = serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Error inesperado: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update(self, request, *args, **kwargs):
        """Actualizar objeto con manejo de errores estandarizado"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if not serializer.is_valid():
            errores = format_validation_errors(serializer.errors)
            return Response({'errores': errores}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            serializer.save()
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Error inesperado: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OperarioViewSet(BaseViewSet):
    queryset = Operario.objects.all()
    serializer_class = OperarioSerializer
    permission_classes = [AllowAny]  # Por ahora sin autenticación

class AdministradorViewSet(BaseViewSet):
    queryset = Administrador.objects.all()
    serializer_class = AdministradorSerializer
    permission_classes = [AllowAny]

class EcoladrilloViewSet(BaseViewSet):
    queryset = Ecoladrillo.objects.all()
    serializer_class = EcoladrilloSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        """Endpoint para obtener ecoladrillos con stock bajo (menos de 10)"""
        ecoladrillos_bajo_stock = self.queryset.filter(cantidad__lt=10)
        serializer = self.get_serializer(ecoladrillos_bajo_stock, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stock_disponible(self, request, pk=None):
        """Obtener la cantidad disponible de un ecoladrillo específico"""
        ecoladrillo = self.get_object()
        return Response({
            'id_ecoladrillo': ecoladrillo.id_ecoladrillo,
            'nombre': ecoladrillo.nombre,
            'cantidad_disponible': ecoladrillo.cantidad
        })
    
    @action(detail=False, methods=['get'])
    def reporte_stock(self, request):
        """Reporte general de stock de todos los ecoladrillos"""
        ecoladrillos = self.get_queryset()
        stock_total = sum(e.cantidad for e in ecoladrillos)
        stock_bajo = ecoladrillos.filter(cantidad__lt=10).count()
        sin_stock = ecoladrillos.filter(cantidad=0).count()
        
        return Response({
            'total_tipos_ecoladrillos': ecoladrillos.count(),
            'stock_total': stock_total,
            'tipos_con_stock_bajo': stock_bajo,
            'tipos_sin_stock': sin_stock,
            'ecoladrillos': self.get_serializer(ecoladrillos, many=True).data
        })

class MaterialViewSet(BaseViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def por_tipo(self, request):
        """
        Obtener materiales filtrados por tipo
        
        Parámetros de consulta:
        - tipo: Tipo de material (búsqueda parcial)
        
        Ejemplo de uso:
        GET /api/v1/materiales/por_tipo/?tipo=Reciclado
        """
        tipo = request.query_params.get('tipo', None)
        if tipo:
            materiales = self.queryset.filter(tipo__icontains=tipo)
            serializer = self.get_serializer(materiales, many=True)
            return Response(serializer.data)
        return Response({'error': 'Parámetro tipo requerido'}, status=400)
    
    @action(detail=False, methods=['get'])
    def stock_disponible(self, request):
        """Materiales con stock disponible"""
        materiales = self.queryset.filter(cantidad_disponible__gt=0)
        serializer = self.get_serializer(materiales, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def reporte_stock(self, request):
        """Reporte general de stock de todos los materiales"""
        materiales = self.get_queryset()
        stock_total = sum(m.cantidad_disponible for m in materiales)
        stock_bajo = materiales.filter(cantidad_disponible__lt=10).count()
        sin_stock = materiales.filter(cantidad_disponible=0).count()

        return Response({
            'total_tipos_materiales': materiales.count(),
            'stock_total': stock_total,
            'tipos_con_stock_bajo': stock_bajo,
            'tipos_sin_stock': sin_stock,
            'materiales': self.get_serializer(materiales, many=True).data
        })



class RegistroEcoladrilloViewSet(BaseViewSet):
    queryset = RegistroEcoladrillo.objects.all().select_related('ecoladrillo', 'ecoladrillo__material_principal')
    serializer_class = RegistroEcoladrilloSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def por_fecha(self, request):
        """
        Filtrar registros por rango de fechas
        
        Parámetros de consulta:
        - fecha_inicio: Fecha de inicio en formato YYYY-MM-DD
        - fecha_fin: Fecha de fin en formato YYYY-MM-DD
        
        Ejemplo de uso:
        GET /api/v1/registros-ecoladrillo/por_fecha/?fecha_inicio=2025-08-01&fecha_fin=2025-08-03
        """
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        queryset = self.get_queryset()
        if fecha_inicio:
            try:
                fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha__gte=fecha_inicio)
            except ValueError:
                return Response({'error': 'Formato de fecha_inicio inválido. Use YYYY-MM-DD'}, status=400)
                
        if fecha_fin:
            try:
                fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha__lte=fecha_fin)
            except ValueError:
                return Response({'error': 'Formato de fecha_fin inválido. Use YYYY-MM-DD'}, status=400)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class RetiroEcoladrilloViewSet(BaseViewSet):
    queryset = RetiroEcoladrillo.objects.all().select_related('ecoladrillo')
    serializer_class = RetiroEcoladrilloSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def por_fecha(self, request):
        """Filtrar retiros por rango de fechas"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        queryset = self.get_queryset()
        if fecha_inicio:
            try:
                fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha__gte=fecha_inicio)
            except ValueError:
                return Response({'error': 'Formato de fecha_inicio inválido. Use YYYY-MM-DD'}, status=400)
                
        if fecha_fin:
            try:
                fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha__lte=fecha_fin)
            except ValueError:
                return Response({'error': 'Formato de fecha_fin inválido. Use YYYY-MM-DD'}, status=400)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_ecoladrillo(self, request):
        """
        Filtrar retiros por tipo de ecoladrillo
        
        Parámetros de consulta:
        - ecoladrillo_id: ID del ecoladrillo
        
        Ejemplo de uso:
        GET /api/v1/retiros-ecoladrillo/por_ecoladrillo/?ecoladrillo_id=1
        """
        ecoladrillo_id = request.query_params.get('ecoladrillo_id')
        if ecoladrillo_id:
            try:
                retiros = self.queryset.filter(ecoladrillo_id=ecoladrillo_id)
                serializer = self.get_serializer(retiros, many=True)
                return Response(serializer.data)
            except ValueError:
                return Response({'error': 'ID de ecoladrillo inválido'}, status=400)
        return Response({'error': 'Parámetro ecoladrillo_id requerido'}, status=400)

class RegistroMaterialViewSet(BaseViewSet):
    queryset = RegistroMaterial.objects.all().select_related('material')
    serializer_class = RegistroMaterialSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """
        Crear registro y actualizar cantidad del material automáticamente
        
        Ejemplo de JSON de entrada:
        {
            "fecha": "2025-08-03",
            "cantidad": 100,
            "material": 1,
            "origen": "Compra directa"
        }
        
        Campos:
        - fecha (requerido): Fecha del registro en formato YYYY-MM-DD
        - cantidad (requerido): Cantidad de material agregada (número positivo)
        - material (requerido): ID del material
        - origen (opcional): Origen del material
        
        Nota: Este endpoint automáticamente actualiza el stock del material
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            errores = format_validation_errors(serializer.errors)
            return Response({'errores': errores}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Guardar el registro
            registro = serializer.save()
            
            # Actualizar cantidad del material
            material = registro.material
            material.agregar_stock(registro.cantidad)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Error inesperado: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReporteViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet solo de lectura para reportes - Los reportes se generan con acciones específicas"""
    queryset = Reporte.objects.all().select_related('operario')
    serializer_class = ReporteSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Obtiene el queryset con los tipos específicos de reportes"""
        # Para list() usar los subtipos específicos
        if self.action == 'list':
            reportes = []
            
            # Agregar reportes de stock en fecha
            for reporte in ReporteStockFecha.objects.select_related('operario'):
                reportes.append(reporte)
            
            # Agregar reportes de resumen de inventario
            for reporte in ReporteResumenInventario.objects.select_related('operario'):
                reportes.append(reporte)
            
            # Agregar reportes de resumen de retiros
            for reporte in ReporteResumenRetiros.objects.select_related('operario'):
                reportes.append(reporte)
            
            # Ordenar por fecha de generación (más recientes primero)
            reportes.sort(key=lambda x: x.fecha_generacion, reverse=True)
            
            return reportes
        else:
            # Para retrieve() usar el queryset base que permite encontrar por ID
            return Reporte.objects.select_related('operario').all()
    
    def get_serializer_class(self):
        """Retorna el serializer específico según el tipo de reporte"""
        if self.action == 'retrieve':
            try:
                obj = self.get_object()
                return self._get_serializer_for_report_type(obj)
            except:
                pass
        return ReporteSerializer
    
    def _get_serializer_for_report_type(self, reporte):
        """Determina el serializer correcto basado en el tipo de reporte"""
        if isinstance(reporte, ReporteStockFecha):
            return ReporteStockFechaSerializer
        elif isinstance(reporte, ReporteResumenInventario):
            return ReporteResumenInventarioSerializer
        elif isinstance(reporte, ReporteResumenRetiros):
            return ReporteResumenRetirosSerializer
        else:
            return ReporteSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Obtiene un reporte específico usando el serializer apropiado"""
        instance = self.get_object()
        
        # Obtener la instancia específica del subtipo correcto
        try:
            if hasattr(instance, 'reportestockfecha'):
                instance = instance.reportestockfecha
            elif hasattr(instance, 'reporteresumeninventario'):
                instance = instance.reporteresumeninventario
            elif hasattr(instance, 'reporteresumenretiros'):
                instance = instance.reporteresumenretiros
        except:
            pass
        
        serializer_class = self._get_serializer_for_report_type(instance)
        serializer = serializer_class(instance)
        return Response(serializer.data)
    
    def list(self, request, *args, **kwargs):
        """Lista todos los reportes usando el serializer apropiado para cada uno"""
        reportes = self.get_queryset()
        
        # Serializar cada reporte con su serializer específico
        reportes_data = []
        for reporte in reportes:
            serializer_class = self._get_serializer_for_report_type(reporte)
            serializer = serializer_class(reporte)
            reportes_data.append(serializer.data)
        
        return Response(reportes_data)
    
    @action(detail=False, methods=['post'])
    def generar_stock_fecha(self, request):
        """
        Genera un reporte de stock en fecha específica usando el nuevo modelo
        
        Ejemplo de JSON de entrada:
        {
            "fecha": "2025-08-03",
            "operario_id": 1
        }
        
        Campos:
        - fecha (requerido): Fecha en formato YYYY-MM-DD
        - operario_id (opcional): ID del operario que genera el reporte
        """
        fecha_str = request.data.get('fecha')
        operario_id = request.data.get('operario_id')
        
        if not fecha_str:
            return Response({
                'error': 'El campo fecha es requerido en formato YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar formato de fecha
        try:
            fecha_consulta = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Formato de fecha inválido. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar operario si se proporciona
        operario = None
        if operario_id:
            try:
                operario = Operario.objects.get(id_usuario=operario_id)
            except Operario.DoesNotExist:
                return Response({
                    'error': f'No existe un operario con ID {operario_id}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear reporte usando el nuevo modelo
        reporte = ReporteStockFecha.objects.create(
            tipo_reporte='stock_fecha',
            operario=operario,
            fecha_consulta=fecha_consulta,
            datos_reporte={}  # Se llenará en el método
        )
        
        # Generar datos usando el método del modelo
        datos_reporte = reporte.generar_datos_stock()
        
        return Response({
            'mensaje': 'Reporte de stock en fecha generado exitosamente',
            'reporte_id': reporte.id_reporte,
            'tipo_reporte': reporte.get_tipo_reporte_display(),
            'fecha_generacion': reporte.fecha_generacion,
            'fecha_consulta': reporte.fecha_consulta,
            'operario': {
                'id': reporte.operario.id_usuario if reporte.operario else None,
                'nombre': reporte.operario.nombre if reporte.operario else 'Sistema'
            },
            'datos': datos_reporte
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def generar_resumen_inventario(self, request):
        """
        Genera un reporte de resumen de inventario usando el nuevo modelo
        
        Ejemplo de JSON de entrada:
        {
            "operario_id": 1
        }
        
        Campos:
        - operario_id (opcional): ID del operario que genera el reporte
        
        Respuesta incluye:
        - ecoladrillos_sin_stock: Lista de ecoladrillos sin stock
        - materiales_sin_stock: Lista de materiales sin stock
        - ecoladrillos_con_stock: Lista de ecoladrillos con stock
        - materiales_con_stock: Lista de materiales con stock
        - resumen_estadisticas: Estadísticas generales del inventario
        """
        operario_id = request.data.get('operario_id')
        
        # Validar operario si se proporciona
        operario = None
        if operario_id:
            try:
                operario = Operario.objects.get(id_usuario=operario_id)
            except Operario.DoesNotExist:
                return Response({
                    'error': f'No existe un operario con ID {operario_id}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear reporte usando el nuevo modelo
        reporte = ReporteResumenInventario.objects.create(
            tipo_reporte='resumen_inventario',
            operario=operario,
            datos_reporte={}  # Se llenará en el método
        )
        
        # Generar datos usando el método del modelo
        datos_reporte = reporte.generar_datos_resumen()
        
        return Response({
            'mensaje': 'Reporte de resumen de inventario generado exitosamente',
            'reporte_id': reporte.id_reporte,
            'tipo_reporte': reporte.get_tipo_reporte_display(),
            'fecha_generacion': reporte.fecha_generacion,
            'operario': {
                'id': reporte.operario.id_usuario if reporte.operario else None,
                'nombre': reporte.operario.nombre if reporte.operario else 'Sistema'
            },
            'datos': datos_reporte
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def generar_resumen_retiros(self, request):
        """
        Genera un reporte de resumen de retiros usando el nuevo modelo
        
        Ejemplo de JSON de entrada:
        {
            "fecha_inicio": "2025-07-01",
            "fecha_fin": "2025-08-03",
            "operario_id": 1
        }
        
        Campos:
        - fecha_inicio (opcional): Fecha de inicio en formato YYYY-MM-DD (por defecto: 30 días atrás)
        - fecha_fin (opcional): Fecha de fin en formato YYYY-MM-DD (por defecto: hoy)
        - operario_id (opcional): ID del operario que genera el reporte
        
        Respuesta incluye:
        - retiros_detalle: Lista detallada de todos los retiros
        - resumen_por_ecoladrillo: Resumen agrupado por tipo de ecoladrillo
        - estadisticas: Estadísticas del período
        - periodo_info: Información del período consultado
        """
        fecha_inicio_str = request.data.get('fecha_inicio')
        fecha_fin_str = request.data.get('fecha_fin')
        operario_id = request.data.get('operario_id')
        
        # Validar operario si se proporciona
        operario = None
        if operario_id:
            try:
                operario = Operario.objects.get(id_usuario=operario_id)
            except Operario.DoesNotExist:
                return Response({
                    'error': f'No existe un operario con ID {operario_id}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar fechas
        try:
            if fecha_inicio_str:
                fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
            else:
                fecha_inicio = timezone.now().date() - timedelta(days=30)
                
            if fecha_fin_str:
                fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').date()
            else:
                fecha_fin = timezone.now().date()
                
        except ValueError:
            return Response({
                'error': 'Formato de fecha inválido. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear reporte usando el nuevo modelo
        reporte = ReporteResumenRetiros.objects.create(
            tipo_reporte='resumen_retiros',
            operario=operario,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            datos_reporte={}  # Se llenará en el método
        )
        
        # Generar datos usando el método del modelo
        datos_reporte = reporte.generar_datos_retiros()
        
        return Response({
            'mensaje': 'Reporte de resumen de retiros generado exitosamente',
            'reporte_id': reporte.id_reporte,
            'tipo_reporte': reporte.get_tipo_reporte_display(),
            'fecha_generacion': reporte.fecha_generacion,
            'operario': {
                'id': reporte.operario.id_usuario if reporte.operario else None,
                'nombre': reporte.operario.nombre if reporte.operario else 'Sistema'
            },
            'periodo': {
                'fecha_inicio': fecha_inicio,
                'fecha_fin': fecha_fin
            },
            'datos': datos_reporte
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def historial(self, request):
        """
        Lista todos los reportes guardados con filtros opcionales
        
        Parámetros de consulta opcionales:
        - tipo: Filtrar por tipo de reporte ('stock_fecha', 'resumen_inventario', 'resumen_retiros')
        - fecha_desde: Filtrar reportes desde una fecha (formato YYYY-MM-DD)
        
        Ejemplo de uso:
        GET /api/v1/reportes/historial/?tipo=resumen_inventario&fecha_desde=2025-08-01
        
        Respuesta incluye todos los campos específicos de cada tipo de reporte
        """
        reportes = self.get_queryset()
        
        # Filtros opcionales
        tipo = request.query_params.get('tipo')
        if tipo:
            reportes = [r for r in reportes if r.tipo_reporte == tipo]
        
        fecha_desde = request.query_params.get('fecha_desde')
        if fecha_desde:
            try:
                fecha_desde = datetime.strptime(fecha_desde, '%Y-%m-%d').date()
                reportes = [r for r in reportes if r.fecha_generacion.date() >= fecha_desde]
            except ValueError:
                pass
        
        # Serializar usando el serializer específico para cada reporte
        reportes_data = []
        for reporte in reportes:
            serializer_class = self._get_serializer_for_report_type(reporte)
            serializer = serializer_class(reporte)
            reportes_data.append(serializer.data)
        
        return Response(reportes_data)
    
    @action(detail=True, methods=['get'])
    def ver_datos(self, request, pk=None):
        """
        Ver solo los datos de un reporte específico usando el serializer apropiado
        
        Ejemplo de uso:
        GET /api/v1/reportes/14/ver_datos/
        
        Respuesta incluye todos los campos específicos según el tipo de reporte:
        - ReporteStockFecha: incluye fecha_consulta, ecoladrillos_sin_stock, etc.
        - ReporteResumenInventario: incluye ecoladrillos_con_stock, materiales_con_stock, etc.
        - ReporteResumenRetiros: incluye fecha_inicio, fecha_fin, retiros_detalle, etc.
        """
        reporte = self.get_object()
        
        # Usar el serializer específico según el tipo de reporte
        if isinstance(reporte, ReporteStockFecha):
            serializer = ReporteStockFechaSerializer(reporte)
        elif isinstance(reporte, ReporteResumenInventario):
            serializer = ReporteResumenInventarioSerializer(reporte)
        elif isinstance(reporte, ReporteResumenRetiros):
            serializer = ReporteResumenRetirosSerializer(reporte)
        else:
            # Fallback al serializer base
            return Response({
                'id_reporte': reporte.id_reporte,
                'tipo_reporte': reporte.get_tipo_reporte_display(),
                'fecha_generacion': reporte.fecha_generacion,
                'operario': {
                    'id': reporte.operario.id_usuario if reporte.operario else None,
                    'nombre': reporte.operario.nombre if reporte.operario else 'Sistema',
                    'cargo': reporte.operario.cargo if reporte.operario else None
                },
                'datos': reporte.datos_reporte
            })
        
        return Response(serializer.data)


    
    
    @action(detail=False, methods=['get'])
    def operarios_disponibles(self, request):
        """
        Lista todos los operarios disponibles para asignar a reportes
        
        Ejemplo de uso:
        GET /api/v1/reportes/operarios_disponibles/
        
        Respuesta:
        [
            {
                "id": 1,
                "nombre": "Pablo",
                "cargo": "contratista",
                "display": "Pablo - contratista"
            }
        ]
        """
        operarios = Operario.objects.all()
        return Response([
            {
                'id': operario.id_usuario,
                'nombre': operario.nombre,
                'cargo': operario.cargo,
                'display': f"{operario.nombre} - {operario.cargo}"
            }
            for operario in operarios
        ])
    
    @action(detail=False, methods=['get'])
    def api_help(self, request):
        """
        Devuelve información de ayuda sobre cómo usar los endpoints de reportes
        
        Ejemplo de uso:
        GET /api/v1/reportes/api_help/
        """
        help_info = {
            "endpoints_disponibles": {
                "generar_stock_fecha": {
                    "metodo": "POST",
                    "url": "/api/v1/reportes/generar_stock_fecha/",
                    "ejemplo_json": {
                        "fecha": "2025-08-03",
                        "operario_id": 1
                    },
                    "campos_requeridos": ["fecha"],
                    "campos_opcionales": ["operario_id"]
                },
                "generar_resumen_inventario": {
                    "metodo": "POST",
                    "url": "/api/v1/reportes/generar_resumen_inventario/",
                    "ejemplo_json": {
                        "operario_id": 1
                    },
                    "campos_requeridos": [],
                    "campos_opcionales": ["operario_id"]
                },
                "generar_resumen_retiros": {
                    "metodo": "POST",
                    "url": "/api/v1/reportes/generar_resumen_retiros/",
                    "ejemplo_json": {
                        "fecha_inicio": "2025-07-01",
                        "fecha_fin": "2025-08-03",
                        "operario_id": 1
                    },
                    "campos_requeridos": [],
                    "campos_opcionales": ["fecha_inicio", "fecha_fin", "operario_id"]
                },
                "listar_reportes": {
                    "metodo": "GET",
                    "url": "/api/v1/reportes/",
                    "descripcion": "Lista todos los reportes con campos específicos"
                },
                "obtener_reporte": {
                    "metodo": "GET",
                    "url": "/api/v1/reportes/{id}/",
                    "descripcion": "Obtiene un reporte específico"
                },
                "operarios_disponibles": {
                    "metodo": "GET",
                    "url": "/api/v1/reportes/operarios_disponibles/",
                    "descripcion": "Lista operarios para asignar a reportes"
                }
            },
            "formatos_fecha": "YYYY-MM-DD (ejemplo: 2025-08-03)",
            "notas": [
                "Los campos operario_id son opcionales en todos los endpoints",
                "Las fechas deben estar en formato YYYY-MM-DD",
                "Los reportes incluyen campos específicos según su tipo",
                "Para usar el browsable API, usar 'Raw data' con JSON"
            ],
            "ejemplo_curl": {
                "generar_inventario": "curl -X POST 'http://localhost:8000/api/v1/reportes/generar_resumen_inventario/' -H 'Content-Type: application/json' -d '{\"operario_id\": 1}'",
                "listar_reportes": "curl -X GET 'http://localhost:8000/api/v1/reportes/'"
            }
        }
        return Response(help_info)
    
    @action(detail=True, methods=['get'])
    def obtener_con_serializer_especifico(self, request, pk=None):
        """Obtiene un reporte usando el serializer específico según su tipo"""
        reporte = self.get_object()
        
        # Determinar el serializer específico
        if isinstance(reporte, ReporteStockFecha):
            serializer = ReporteStockFechaSerializer(reporte)
        elif isinstance(reporte, ReporteResumenInventario):
            serializer = ReporteResumenInventarioSerializer(reporte)
        elif isinstance(reporte, ReporteResumenRetiros):
            serializer = ReporteResumenRetirosSerializer(reporte)
        else:
            serializer = ReporteSerializer(reporte)
        
        return Response(serializer.data)
# ViewSets específicos para cada tipo de reporte
class ReporteStockFechaViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet específico para reportes de stock en fecha"""
    queryset = ReporteStockFecha.objects.all()
    serializer_class = ReporteStockFechaSerializer
    permission_classes = [AllowAny]

class ReporteResumenInventarioViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet específico para reportes de resumen de inventario"""
    queryset = ReporteResumenInventario.objects.all()
    serializer_class = ReporteResumenInventarioSerializer
    permission_classes = [AllowAny]

class ReporteResumenRetirosViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet específico para reportes de resumen de retiros"""
    queryset = ReporteResumenRetiros.objects.all()
    serializer_class = ReporteResumenRetirosSerializer
    permission_classes = [AllowAny]
    