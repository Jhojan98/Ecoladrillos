from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from ..models import Usuario, PerfilOperario, PerfilAdministrador
from .serializers import (
    UsuarioSerializer, 
    UsuarioCreateSerializer, 
    LoginSerializer,
    CambiarPasswordSerializer,
    PerfilOperarioSerializer,
    PerfilAdministradorSerializer,
    RegistroUsuarioSerializer
)


class UsuarioListCreateView(generics.ListCreateAPIView):
    """
    👥 GESTIÓN DE USUARIOS
    
    GET: Lista todos los usuarios del sistema
    POST: Crea un nuevo usuario (solo administradores)
    
    Requiere autenticación para ambas operaciones.
    """
    queryset = Usuario.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UsuarioCreateSerializer
        return UsuarioSerializer
    
    def get_permissions(self):
        """
        Solo administradores pueden crear usuarios
        """
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]


class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Detalle, actualización y eliminación de usuario
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]


class PerfilUsuarioView(generics.RetrieveUpdateAPIView):
    """
    👤 MI PERFIL
    
    GET: Ver tu información personal
    PUT/PATCH: Actualizar tu información personal
    
    Solo puedes ver y modificar tu propio perfil.
    """
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def registro_view(request):
    """
    📝 REGISTRO DE NUEVO USUARIO
    
    Crea una nueva cuenta de usuario. No requiere autenticación previa.
    
    Campos requeridos:
    - username: Nombre de usuario único
    - email: Correo electrónico válido  
    - first_name: Nombre
    - last_name: Apellido
    - tipo_usuario: 'operario' o 'administrador'
    - password: Contraseña (mínimo 8 caracteres)
    - password_confirm: Confirmación de contraseña
    
    Retorna: Información del usuario creado + tokens de autenticación
    """
    serializer = RegistroUsuarioSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Crear token JWT para el usuario recién registrado
        refresh = RefreshToken.for_user(user)
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'Usuario registrado exitosamente',
            'user': UsuarioSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    🔐 LOGIN DE USUARIO
    
    Autentica un usuario existente y retorna tokens de acceso.
    
    Campos requeridos:
    - username: Tu nombre de usuario
    - password: Tu contraseña
    
    Retorna: Información del usuario + tokens JWT + tipo de usuario
    """
    serializer = LoginSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # También crear token de sesión para compatibilidad
        token, created = Token.objects.get_or_create(user=user)
        
        # Hacer login en la sesión
        login(request, user)
        
        return Response({
            'message': 'Login exitoso',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'tipo_usuario': user.tipo_usuario,
                'es_administrador': user.es_administrador,
                'es_operario': user.es_operario,
                'is_active': user.is_active
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'token': token.key  # Token de sesión para compatibilidad
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Vista de logout
    """
    try:
        # Eliminar token de sesión
        request.user.auth_token.delete()
    except:
        pass
    
    logout(request)
    return Response({'message': 'Logout exitoso'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cambiar_password_view(request):
    """
    Cambiar contraseña del usuario autenticado
    """
    serializer = CambiarPasswordSerializer(
        data=request.data, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['password_nueva'])
        user.save()
        
        return Response({
            'message': 'Contraseña cambiada exitosamente'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OperarioListView(generics.ListAPIView):
    """
    Lista todos los operarios
    """
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Usuario.objects.filter(tipo_usuario='operario')


class AdministradorListView(generics.ListAPIView):
    """
    Lista todos los administradores
    """
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Usuario.objects.filter(tipo_usuario='administrador')


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_root_view(request):
    """
    🏠 API ECOLADRILLOS - GESTIÓN DE USUARIOS
    
    Bienvenido a la API de gestión de usuarios del sistema Ecoladrillos.
    
    📋 ENDPOINTS DISPONIBLES:
    
    🔓 PÚBLICOS (sin autenticación):
    • GET  /tipos-usuario/     - Lista tipos de usuario disponibles
    • POST /registro/          - Registrar nuevo usuario  
    • POST /login/             - Iniciar sesión
    
    🔐 AUTENTICADOS:
    • GET  /usuarios/          - Listar todos los usuarios
    • POST /usuarios/          - Crear nuevo usuario (admin)
    • GET  /usuarios/{id}/     - Detalles de usuario específico
    • GET  /perfil/            - Tu perfil de usuario
    • POST /logout/            - Cerrar sesión
    • POST /cambiar-password/  - Cambiar contraseña
    • GET  /operarios/         - Listar solo operarios
    • GET  /administradores/   - Listar solo administradores
    • GET  /estadisticas/      - Estadísticas de usuarios
    
    💡 TIP: Navega a cualquier endpoint para ver el formulario automático
    """
    from django.urls import reverse
    
    return Response({
        'message': '🏠 API Ecoladrillos - Gestión de Usuarios',
        'endpoints_publicos': {
            'tipos_usuario': request.build_absolute_uri(reverse('tipos-usuario')),
            'registro': request.build_absolute_uri(reverse('registro')),
            'login': request.build_absolute_uri(reverse('login')),
        },
        'endpoints_autenticados': {
            'usuarios': request.build_absolute_uri(reverse('usuario-list-create')),
            'perfil': request.build_absolute_uri(reverse('perfil-usuario')),
            'logout': request.build_absolute_uri(reverse('logout')),
            'cambiar_password': request.build_absolute_uri(reverse('cambiar-password')),
            'operarios': request.build_absolute_uri(reverse('operarios-list')),
            'administradores': request.build_absolute_uri(reverse('administradores-list')),
            'estadisticas': request.build_absolute_uri(reverse('estadisticas-usuarios')),
        },
        'documentacion': '📖 Visita cualquier endpoint para ver formularios automáticos',
        'autenticacion': {
            'tipos': ['Token', 'JWT', 'Session'],
            'header': 'Authorization: Bearer <token>'
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def tipos_usuario_view(request):
    """
    📋 TIPOS DE USUARIO DISPONIBLES
    
    Obtiene la lista de tipos de usuario que se pueden seleccionar
    durante el registro. No requiere autenticación.
    
    Retorna: Lista con 'operario' y 'administrador'
    """
    return Response({
        'tipos_usuario': [
            {'value': choice[0], 'label': choice[1]} 
            for choice in Usuario.TIPO_USUARIO_CHOICES
        ]
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def estadisticas_usuarios_view(request):
    """
    Estadísticas básicas de usuarios
    """
    total_usuarios = Usuario.objects.count()
    total_operarios = Usuario.objects.filter(tipo_usuario='operario').count()
    total_administradores = Usuario.objects.filter(tipo_usuario='administrador').count()
    usuarios_activos = Usuario.objects.filter(is_active=True).count()
    
    return Response({
        'total_usuarios': total_usuarios,
        'total_operarios': total_operarios,
        'total_administradores': total_administradores,
        'usuarios_activos': usuarios_activos,
        'usuarios_inactivos': total_usuarios - usuarios_activos
    }, status=status.HTTP_200_OK)
