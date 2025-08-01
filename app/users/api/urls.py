from django.urls import path
from .views import (
    UsuarioListCreateView,
    UsuarioDetailView,
    PerfilUsuarioView,
    api_root_view,
    registro_view,
    login_view,
    logout_view,
    cambiar_password_view,
    OperarioListView,
    AdministradorListView,
    tipos_usuario_view,
    estadisticas_usuarios_view
)

urlpatterns = [
    # Página principal de la API
    path('', api_root_view, name='api-root'),
    
    # Gestión de usuarios
    path('usuarios/', UsuarioListCreateView.as_view(), name='usuario-list-create'),
    path('usuarios/<int:pk>/', UsuarioDetailView.as_view(), name='usuario-detail'),
    path('perfil/', PerfilUsuarioView.as_view(), name='perfil-usuario'),
    
    # Autenticación
    path('tipos-usuario/', tipos_usuario_view, name='tipos-usuario'),
    path('registro/', registro_view, name='registro'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('cambiar-password/', cambiar_password_view, name='cambiar-password'),
    
    # Listas específicas
    path('operarios/', OperarioListView.as_view(), name='operarios-list'),
    path('administradores/', AdministradorListView.as_view(), name='administradores-list'),
    
    # Estadísticas
    path('estadisticas/', estadisticas_usuarios_view, name='estadisticas-usuarios'),
]
