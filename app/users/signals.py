from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Usuario, PerfilOperario, PerfilAdministrador

@receiver(post_save, sender=Usuario)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    """
    Crea automáticamente el perfil correspondiente cuando se crea un usuario
    """
    if created:
        if instance.tipo_usuario == 'operario':
            PerfilOperario.objects.create(
                usuario=instance,
                cargo='Sin asignar'  # Valor por defecto
            )
        elif instance.tipo_usuario == 'administrador':
            PerfilAdministrador.objects.create(
                usuario=instance,
                nivel_acceso='total'
            )

@receiver(post_save, sender=Usuario)
def guardar_perfil_usuario(sender, instance, **kwargs):
    """
    Guarda el perfil cuando se actualiza el usuario
    """
    if instance.tipo_usuario == 'operario':
        if hasattr(instance, 'perfil_operario'):
            instance.perfil_operario.save()
        else:
            # Si no existe el perfil, lo creamos
            PerfilOperario.objects.create(
                usuario=instance,
                cargo='Sin asignar'
            )
    elif instance.tipo_usuario == 'administrador':
        if hasattr(instance, 'perfil_administrador'):
            instance.perfil_administrador.save()
        else:
            # Si no existe el perfil, lo creamos
            PerfilAdministrador.objects.create(
                usuario=instance,
                nivel_acceso='total'
            )
