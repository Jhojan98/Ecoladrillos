from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EcoladrilloViewSet,
    MaterialViewSet, RegistroEcoladrilloViewSet, RetiroEcoladrilloViewSet,
    RegistroMaterialViewSet, ReporteViewSet
)

# Crear el router para los ViewSets
router = DefaultRouter()

# Registrar los ViewSets con sus respectivos endpoints
router.register(r'ecoladrillos', EcoladrilloViewSet, basename='ecoladrillo')
router.register(r'materiales', MaterialViewSet, basename='material')
router.register(r'registros-ecoladrillo', RegistroEcoladrilloViewSet, basename='registro-ecoladrillo')
router.register(r'retiros-ecoladrillo', RetiroEcoladrilloViewSet, basename='retiro-ecoladrillo')
router.register(r'registros-material', RegistroMaterialViewSet, basename='registro-material')
router.register(r'reportes', ReporteViewSet, basename='reporte')

urlpatterns = [
    # Incluir todas las URLs del router
    path('', include(router.urls)),
]