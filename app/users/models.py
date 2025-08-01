from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class Usuario(AbstractUser):
    """
    Modelo base de usuario extendiendo AbstractUser de Django
    """
    TIPO_USUARIO_CHOICES = [
        ('operario', 'Operario'),
        ('administrador', 'Administrador'),
    ]
    
    tipo_usuario = models.CharField(
        max_length=20, 
        choices=TIPO_USUARIO_CHOICES,
        help_text="Tipo de usuario: operario o administrador"
    )
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_tipo_usuario_display()})"
    
    @property
    def es_administrador(self):
        return self.tipo_usuario == 'administrador'
    
    @property
    def es_operario(self):
        return self.tipo_usuario == 'operario'


class PerfilOperario(models.Model):
    """
    Perfil específico para operarios
    """
    usuario = models.OneToOneField(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='perfil_operario'
    )
    cargo = models.CharField(max_length=100)
    fecha_ingreso = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.cargo}"
    
    class Meta:
        verbose_name = "Perfil de Operario"
        verbose_name_plural = "Perfiles de Operarios"


class PerfilAdministrador(models.Model):
    """
    Perfil específico para administradores
    """
    usuario = models.OneToOneField(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='perfil_administrador'
    )
    nivel_acceso = models.CharField(
        max_length=50, 
        default='total',
        help_text="Nivel de acceso administrativo"
    )
    fecha_asignacion = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"Administrador: {self.usuario.get_full_name()}"
    
    class Meta:
        verbose_name = "Perfil de Administrador"
        verbose_name_plural = "Perfiles de Administradores"
