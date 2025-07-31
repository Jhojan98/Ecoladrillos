from django.contrib import admin
from .models import Ecoladrillo, Material, RegistroEcoladrillo, RetiroEcoladrillo, RegistroMaterial, Reporte
# Register your models here.

@admin.register(Ecoladrillo)
class EcoladrilloAdmin(admin.ModelAdmin):
    list_display = ('id_ecoladrillo', 'nombre', 'size', 'material_principal', 'cantidad_material_requerida', 'cantidad')
    search_fields = ('nombre',)
    list_filter = ('size', 'material_principal')

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('id_insumo', 'nombre', 'tipo', 'cantidad_disponible', 'unidad_medida')
    search_fields = ('nombre', 'tipo')
    list_filter = ('tipo',)

@admin.register(RegistroEcoladrillo)
class RegistroEcoladrilloAdmin(admin.ModelAdmin):
    list_display = ('id_registro', 'fecha', 'ecoladrillo', 'cantidad', 'usuario')
    search_fields = ('ecoladrillo__nombre', 'usuario__username', 'usuario__first_name', 'usuario__last_name')
    list_filter = ('fecha', 'ecoladrillo', 'usuario')
    raw_id_fields = ['usuario']  # Para facilitar la selección cuando hay muchos usuarios

@admin.register(RetiroEcoladrillo)
class RetiroEcoladrilloAdmin(admin.ModelAdmin):
    list_display = ('id_retiro', 'fecha', 'ecoladrillo', 'cantidad', 'motivo', 'usuario')
    search_fields = ('motivo', 'ecoladrillo__nombre', 'usuario__username', 'usuario__first_name', 'usuario__last_name') 
    list_filter = ('fecha', 'ecoladrillo', 'usuario')
    ordering = ('-fecha',)
    raw_id_fields = ['usuario']

@admin.register(RegistroMaterial)
class RegistroMaterialAdmin(admin.ModelAdmin):
    list_display = ('id_registro_material', 'fecha', 'material', 'cantidad', 'origen', 'usuario')
    search_fields = ('material__nombre', 'origen', 'usuario__username', 'usuario__first_name', 'usuario__last_name')
    list_filter = ('fecha', 'material', 'usuario')
    raw_id_fields = ['usuario']

@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):
    list_display = ('id_reporte', 'fecha_generacion', 'fecha_inicio', 'fecha_fin')
    list_filter = ('fecha_generacion', 'fecha_inicio', 'fecha_fin')
    ordering = ('-fecha_generacion',)


