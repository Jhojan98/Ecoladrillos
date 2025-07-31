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
    PerfilAdministradorSerializer
)


class UsuarioListCreateView(generics.ListCreateAPIView):
    """
    Lista todos los usuarios o crea uno nuevo
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
    Ver y actualizar el perfil del usuario autenticado
    """
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    Vista de login que retorna token JWT
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
            'user': UsuarioSerializer(user).data,
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
