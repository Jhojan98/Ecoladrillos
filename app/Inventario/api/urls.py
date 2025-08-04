from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OperarioViewSet, AdministradorViewSet, EcoladrilloViewSet,
    MaterialViewSet, RegistroEcoladrilloViewSet, RetiroEcoladrilloViewSet,
    RegistroMaterialViewSet, ReporteViewSet, ReporteStockFechaViewSet,
    ReporteResumenInventarioViewSet, ReporteResumenRetirosViewSet
)

# Crear el router para los ViewSets
router = DefaultRouter()

# Registrar los ViewSets con sus respectivos endpoints
router.register(r'operarios', OperarioViewSet, basename='operario')
router.register(r'administradores', AdministradorViewSet, basename='administrador')
router.register(r'ecoladrillos', EcoladrilloViewSet, basename='ecoladrillo')
router.register(r'materiales', MaterialViewSet, basename='material')
router.register(r'registros-ecoladrillo', RegistroEcoladrilloViewSet, basename='registro-ecoladrillo')
router.register(r'retiros-ecoladrillo', RetiroEcoladrilloViewSet, basename='retiro-ecoladrillo')
router.register(r'registros-material', RegistroMaterialViewSet, basename='registro-material')

# Reportes - ViewSet general y específicos
router.register(r'reportes', ReporteViewSet, basename='reporte')
router.register(r'reportes-stock-fecha', ReporteStockFechaViewSet, basename='reporte-stock-fecha')
router.register(r'reportes-resumen-inventario', ReporteResumenInventarioViewSet, basename='reporte-resumen-inventario')
router.register(r'reportes-resumen-retiros', ReporteResumenRetirosViewSet, basename='reporte-resumen-retiros')

urlpatterns = [
    # Incluir todas las URLs del router
    path('', include(router.urls)),
]