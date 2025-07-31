from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta

from ..models import (
    Ecoladrillo, Material,
    RegistroEcoladrillo, RetiroEcoladrillo, RegistroMaterial, Reporte
)
from .serializers import (
    EcoladrilloSerializer,
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

class EcoladrilloViewSet(BaseViewSet):
    queryset = Ecoladrillo.objects.all()
    serializer_class = EcoladrilloSerializer
    permission_classes = [IsAuthenticated]
    
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
    permission_classes = [IsAuthenticated]
    
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

class RegistroEcoladrilloViewSet(BaseViewSet):
    queryset = RegistroEcoladrillo.objects.all().select_related('ecoladrillo', 'ecoladrillo__material_principal', 'usuario')
    serializer_class = RegistroEcoladrilloSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        """Asignar automáticamente el usuario autenticado al crear un registro"""
        serializer.save(usuario=self.request.user)
    
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
    queryset = RetiroEcoladrillo.objects.all().select_related('ecoladrillo', 'usuario')
    serializer_class = RetiroEcoladrilloSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        """Asignar automáticamente el usuario autenticado al crear un retiro"""
        serializer.save(usuario=self.request.user)
    
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
    queryset = RegistroMaterial.objects.all().select_related('material', 'usuario')
    serializer_class = RegistroMaterialSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        """Asignar automáticamente el usuario autenticado al crear un registro de material"""
        serializer.save(usuario=self.request.user)
    
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
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def resumen_inventario(self, request):
        """Endpoint para obtener un resumen del inventario"""
        total_ecoladrillos = Ecoladrillo.objects.count()
        total_materiales = Material.objects.count()
        materiales_sin_stock = Material.objects.filter(cantidad_disponible=0).count()
        
        resumen = {
            'total_ecoladrillos': total_ecoladrillos,
            'total_materiales': total_materiales,
            'materiales_sin_stock': materiales_sin_stock,
            'fecha_consulta': timezone.now().date()
        }
        return Response(resumen)
    
    @action(detail=False, methods=['get'])
    def resumen_retiros(self, request):
        """Resumen de retiros de ecoladrillos"""
        desde = request.query_params.get('fecha_inicio')
        hasta = request.query_params.get('fecha_fin')
        
        retiros = RetiroEcoladrillo.objects.all()
        if desde:
            retiros = retiros.filter(fecha__gte=desde)
        if hasta:
            retiros = retiros.filter(fecha__lte=hasta)
        
        total_retiros = retiros.count()
        cantidad_total_retirada = sum(r.cantidad for r in retiros)
        
        # Agrupar por tipo de ecoladrillo
        retiros_por_tipo = {}
        for retiro in retiros:
            nombre = retiro.ecoladrillo.nombre
            if nombre not in retiros_por_tipo:
                retiros_por_tipo[nombre] = 0
            retiros_por_tipo[nombre] += retiro.cantidad
        
        return Response({
            'total_retiros': total_retiros,
            'cantidad_total_retirada': cantidad_total_retirada,
            'retiros_por_tipo': retiros_por_tipo,
            'periodo': {
                'fecha_inicio': desde,
                'fecha_fin': hasta
            }
        })