from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Sum
from datetime import datetime, timedelta

from ..models import (
    Operario, Administrador, Ecoladrillo, Material,
    RegistroEcoladrillo, RetiroEcoladrillo, RegistroMaterial, Reporte
)
from .serializers import (
    OperarioSerializer, AdministradorSerializer, EcoladrilloSerializer,
    MaterialSerializer, RegistroEcoladrilloSerializer, RetiroEcoladrilloSerializer,
    RegistroMaterialSerializer, ReporteSerializer
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
        """Obtener materiales filtrados por tipo"""
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
        """Filtrar registros por rango de fechas"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        queryset = self.get_queryset()
        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)
            
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
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_ecoladrillo(self, request):
        """Filtrar retiros por tipo de ecoladrillo"""
        ecoladrillo_id = request.query_params.get('ecoladrillo_id')
        if ecoladrillo_id:
            retiros = self.queryset.filter(ecoladrillo_id=ecoladrillo_id)
            serializer = self.get_serializer(retiros, many=True)
            return Response(serializer.data)
        return Response({'error': 'Parámetro ecoladrillo_id requerido'}, status=400)

class RegistroMaterialViewSet(BaseViewSet):
    queryset = RegistroMaterial.objects.all().select_related('material')
    serializer_class = RegistroMaterialSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Crear registro y actualizar cantidad del material automáticamente"""
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

class ReporteViewSet(BaseViewSet):
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer
    permission_classes = [AllowAny]
    
    def _generar_stock_en_fecha(self, fecha_consulta):
        """Calcula los datos del reporte de stock en fecha"""
        # Stock de ecoladrillos en la fecha
        ecoladrillos_data = []
        for ecoladrillo in Ecoladrillo.objects.all():
            # Producciones hasta la fecha
            total_producido = RegistroEcoladrillo.objects.filter(
                ecoladrillo=ecoladrillo,
                fecha__lte=fecha_consulta
            ).aggregate(total=Sum('cantidad'))['total'] or 0
            
            # Retiros hasta la fecha
            total_retirado = RetiroEcoladrillo.objects.filter(
                ecoladrillo=ecoladrillo,
                fecha__lte=fecha_consulta
            ).aggregate(total=Sum('cantidad'))['total'] or 0
            
            stock_calculado = max(0, total_producido - total_retirado)
            
            ecoladrillos_data.append({
                'nombre': ecoladrillo.nombre,
                'stock_en_fecha': stock_calculado,
                'stock_actual': ecoladrillo.cantidad
            })
        
        # Stock de materiales en la fecha
        materiales_data = []
        for material in Material.objects.all():
            # Ingresos hasta la fecha
            total_ingresado = RegistroMaterial.objects.filter(
                material=material,
                fecha__lte=fecha_consulta
            ).aggregate(total=Sum('cantidad'))['total'] or 0
            
            # Material consumido por producciones hasta la fecha
            material_consumido = 0
            producciones = RegistroEcoladrillo.objects.filter(
                ecoladrillo__material_principal=material,
                fecha__lte=fecha_consulta
            )
            for produccion in producciones:
                material_consumido += produccion.ecoladrillo.calcular_material_necesario(produccion.cantidad)
            
            stock_calculado = max(0, total_ingresado - material_consumido)
            
            materiales_data.append({
                'nombre': material.nombre,
                'stock_en_fecha': stock_calculado,
                'stock_actual': material.cantidad_disponible
            })
        
        return {
            'fecha_consulta': fecha_consulta.isoformat(),
            'fecha_generacion': timezone.now().isoformat(),
            'ecoladrillos': ecoladrillos_data,
            'materiales': materiales_data
        }
    
    def _generar_resumen_inventario(self):
        """Calcula los datos del resumen de inventario"""
        total_ecoladrillos = Ecoladrillo.objects.count()
        total_materiales = Material.objects.count()
        materiales_sin_stock = Material.objects.filter(cantidad_disponible=0).count()
        ecoladrillos_sin_stock = Ecoladrillo.objects.filter(cantidad=0).count()
        
        return {
            'fecha_consulta': timezone.now().date().isoformat(),
            'fecha_generacion': timezone.now().isoformat(),
            'total_ecoladrillos': total_ecoladrillos,
            'total_materiales': total_materiales,
            'materiales_sin_stock': materiales_sin_stock,
            'ecoladrillos_sin_stock': ecoladrillos_sin_stock
        }
    
    def _generar_resumen_retiros(self, fecha_inicio, fecha_fin):
        """Calcula los datos del resumen de retiros"""
        retiros = RetiroEcoladrillo.objects.filter(fecha__gte=fecha_inicio, fecha__lte=fecha_fin)
        total_retiros = retiros.count()
        cantidad_total_retirada = retiros.aggregate(total=Sum('cantidad'))['total'] or 0
        
        # Agrupar por tipo de ecoladrillo
        retiros_por_tipo = {}
        for retiro in retiros.select_related('ecoladrillo'):
            nombre = retiro.ecoladrillo.nombre
            retiros_por_tipo[nombre] = retiros_por_tipo.get(nombre, 0) + retiro.cantidad
        
        return {
            'fecha_generacion': timezone.now().isoformat(),
            'periodo': {
                'fecha_inicio': fecha_inicio.isoformat(),
                'fecha_fin': fecha_fin.isoformat()
            },
            'total_retiros': total_retiros,
            'cantidad_total_retirada': cantidad_total_retirada,
            'retiros_por_tipo': retiros_por_tipo
        }
    
    @action(detail=False, methods=['post'])
    def generar_stock_fecha(self, request):
        """Genera un reporte de stock en fecha específica y lo guarda"""
        fecha_str = request.data.get('fecha')
        
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
        
        # Generar datos del reporte
        datos_reporte = self._generar_stock_en_fecha(fecha_consulta)
        
        # Guardar en base de datos
        reporte = Reporte.objects.create(
            tipo_reporte='stock_fecha',
            # TODO: operario=request.user.operario cuando se implemente autenticación
            fecha_consulta=fecha_consulta,
            datos_reporte=datos_reporte
        )
        
        return Response({
            'mensaje': 'Reporte generado exitosamente',
            'reporte_id': reporte.id_reporte,
            'tipo_reporte': reporte.get_tipo_reporte_display(),
            'fecha_generacion': reporte.fecha_generacion,
            'fecha_consulta': reporte.fecha_consulta,
            'datos': datos_reporte
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def generar_resumen_inventario(self, request):
        """Genera un reporte de resumen de inventario actual"""
        # Generar datos del reporte
        datos_reporte = self._generar_resumen_inventario()
        
        # Guardar en base de datos
        reporte = Reporte.objects.create(
            tipo_reporte='resumen_inventario',
            # TODO: operario=request.user.operario cuando se implemente autenticación
            fecha_consulta=timezone.now().date(),
            datos_reporte=datos_reporte
        )
        
        return Response({
            'mensaje': 'Reporte generado exitosamente',
            'reporte_id': reporte.id_reporte,
            'tipo_reporte': reporte.get_tipo_reporte_display(),
            'fecha_generacion': reporte.fecha_generacion,
            'datos': datos_reporte
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def generar_resumen_retiros(self, request):
        """Genera un reporte de resumen de retiros en un período"""
        fecha_inicio_str = request.data.get('fecha_inicio')
        fecha_fin_str = request.data.get('fecha_fin')
        
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
        
        # Generar datos del reporte
        datos_reporte = self._generar_resumen_retiros(fecha_inicio, fecha_fin)
        
        # Guardar en base de datos
        reporte = Reporte.objects.create(
            tipo_reporte='resumen_retiros',
            # TODO: operario=request.user.operario cuando se implemente autenticación
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            datos_reporte=datos_reporte
        )
        
        return Response({
            'mensaje': 'Reporte generado exitosamente',
            'reporte_id': reporte.id_reporte,
            'tipo_reporte': reporte.get_tipo_reporte_display(),
            'fecha_generacion': reporte.fecha_generacion,
            'periodo': {
                'fecha_inicio': fecha_inicio,
                'fecha_fin': fecha_fin
            },
            'datos': datos_reporte
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def historial(self, request):
        """Lista todos los reportes guardados"""
        reportes = self.get_queryset()
        
        # Filtros opcionales
        tipo = request.query_params.get('tipo')
        if tipo:
            reportes = reportes.filter(tipo_reporte=tipo)
        
        fecha_desde = request.query_params.get('fecha_desde')
        if fecha_desde:
            try:
                fecha_desde = datetime.strptime(fecha_desde, '%Y-%m-%d').date()
                reportes = reportes.filter(fecha_generacion__date__gte=fecha_desde)
            except ValueError:
                pass
        
        serializer = self.get_serializer(reportes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def ver_datos(self, request, pk=None):
        """Ver solo los datos de un reporte específico"""
        reporte = self.get_object()
        return Response({
            'id_reporte': reporte.id_reporte,
            'tipo_reporte': reporte.get_tipo_reporte_display(),
            'fecha_generacion': reporte.fecha_generacion,
            'operario': reporte.operario.nombre if reporte.operario else 'Sistema',
            'datos': reporte.datos_reporte
        })