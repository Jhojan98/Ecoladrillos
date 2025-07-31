from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, PerfilOperario, PerfilAdministrador

# Register your models here.

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """
    Administración de usuarios con campos personalizados
    """
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {
            'fields': ('tipo_usuario',)
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información Adicional', {
            'fields': ('tipo_usuario', 'email', 'first_name', 'last_name')
        }),
    )
    
    list_display = ['username', 'email', 'first_name', 'last_name', 'tipo_usuario', 'is_active', 'date_joined']
    list_filter = UserAdmin.list_filter + ('tipo_usuario',)
    search_fields = ['username', 'email', 'first_name', 'last_name']


@admin.register(PerfilOperario)
class PerfilOperarioAdmin(admin.ModelAdmin):
    """
    Administración de perfiles de operarios
    """
    list_display = ['usuario', 'cargo', 'fecha_ingreso']
    list_filter = ['cargo', 'fecha_ingreso']
    search_fields = ['usuario__username', 'usuario__first_name', 'usuario__last_name', 'cargo']
    raw_id_fields = ['usuario']


@admin.register(PerfilAdministrador)
class PerfilAdministradorAdmin(admin.ModelAdmin):
    """
    Administración de perfiles de administradores
    """
    list_display = ['usuario', 'nivel_acceso', 'fecha_asignacion']
    list_filter = ['nivel_acceso', 'fecha_asignacion']
    search_fields = ['usuario__username', 'usuario__first_name', 'usuario__last_name']
    raw_id_fields = ['usuario']
