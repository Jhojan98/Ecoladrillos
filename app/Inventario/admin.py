from django.contrib import admin
from .models import Operario, Administrador, Ecoladrillo, Material, RegistroEcoladrillo, RetiroEcoladrillo
# Register your models here.

@admin.register(Operario)
class OperarioAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'nombre', 'email', 'cargo')
    search_fields = ('nombre', 'email')

@admin.register(Administrador)
class AdministradorAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'nombre', 'email')
    search_fields = ('nombre', 'email')
@admin.register(Ecoladrillo)
class EcoladrilloAdmin(admin.ModelAdmin):
    list_display = ('id_ecoladrillo', 'nombre', 'size', 'material_principal', 'cantidad_material_requerida', 'cantidad')
    search_fields = ('nombre',)
    list_filter = ('size', 'material_principal')

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('id_insumo', 'nombre', 'tipo', 'cantidad_disponible', 'unidad_medida')
    search_fields = ('nombre', 'tipo')

@admin.register(RegistroEcoladrillo)
class RegistroEcoladrilloAdmin(admin.ModelAdmin):
    list_display = ('id_registro', 'fecha', 'ecoladrillo', 'cantidad')
    search_fields = ('fecha',)
    list_filter = ('fecha', 'ecoladrillo')
@admin.register(RetiroEcoladrillo)
class RetiroEcoladrilloAdmin(admin.ModelAdmin):
    list_display = ('id_retiro', 'fecha', 'cantidad', 'motivo')
    search_fields = ('fecha', 'motivo') 
    list_filter = ('fecha',)
    ordering = ('-fecha',)


