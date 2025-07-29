from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
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

class OperarioViewSet(viewsets.ModelViewSet):
    queryset = Operario.objects.all()
    serializer_class = OperarioSerializer
    permission_classes = [AllowAny]  # Por ahora sin autenticación

class AdministradorViewSet(viewsets.ModelViewSet):
    queryset = Administrador.objects.all()
    serializer_class = AdministradorSerializer
    permission_classes = [AllowAny]

class EcoladrilloViewSet(viewsets.ModelViewSet):
    queryset = Ecoladrillo.objects.all()
    serializer_class = EcoladrilloSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        """Endpoint para obtener ecoladrillos con stock bajo (menos de 10)"""
        ecoladrillos_bajo_stock = self.queryset.filter(cantidad__lt=10)
        serializer = self.get_serializer(ecoladrillos_bajo_stock, many=True)
        return Response(serializer.data)

class MaterialViewSet(viewsets.ModelViewSet):
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

class RegistroEcoladrilloViewSet(viewsets.ModelViewSet):
    queryset = RegistroEcoladrillo.objects.all().select_related('material_usado')
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

class RetiroEcoladrilloViewSet(viewsets.ModelViewSet):
    queryset = RetiroEcoladrillo.objects.all()
    serializer_class = RetiroEcoladrilloSerializer
    permission_classes = [AllowAny]

    

class RegistroMaterialViewSet(viewsets.ModelViewSet):
    queryset = RegistroMaterial.objects.all().select_related('material')
    serializer_class = RegistroMaterialSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Crear registro y actualizar cantidad del material automáticamente"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Guardar el registro
        registro = serializer.save()
        
        # Actualizar cantidad del material
        material = registro.material
        material.cantidad_disponible += registro.cantidad      
        material.save()
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReporteViewSet(viewsets.ModelViewSet):
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer
    permission_classes = [AllowAny]
    
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