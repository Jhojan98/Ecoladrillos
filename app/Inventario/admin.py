from django.contrib import admin
from .models import (
    Operario, Administrador, Ecoladrillo, Material, 
    RegistroEcoladrillo, RetiroEcoladrillo, RegistroMaterial, Reporte,
    ReporteStockFecha, ReporteResumenInventario, ReporteResumenRetiros
)

@admin.register(Operario)
class OperarioAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'nombre', 'email', 'cargo')
    search_fields = ('nombre', 'email', 'cargo')
    list_filter = ('cargo',)
    ordering = ('nombre',)

@admin.register(Administrador)
class AdministradorAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'nombre', 'email')
    search_fields = ('nombre', 'email')
    ordering = ('nombre',)

@admin.register(Ecoladrillo)
class EcoladrilloAdmin(admin.ModelAdmin):
    list_display = ('id_ecoladrillo', 'nombre', 'size', 'material_principal', 'cantidad_material_requerida', 'cantidad')
    search_fields = ('nombre',)
    list_filter = ('size', 'material_principal')
    ordering = ('nombre',)
    readonly_fields = ('cantidad',)  # El stock se maneja automáticamente

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('id_insumo', 'nombre', 'tipo', 'cantidad_disponible', 'unidad_medida')
    search_fields = ('nombre', 'tipo')
    list_filter = ('tipo', 'unidad_medida')
    ordering = ('nombre',)

@admin.register(RegistroEcoladrillo)
class RegistroEcoladrilloAdmin(admin.ModelAdmin):
    list_display = ('id_registro', 'fecha', 'ecoladrillo', 'cantidad')
    search_fields = ('ecoladrillo__nombre',)
    list_filter = ('fecha', 'ecoladrillo')
    date_hierarchy = 'fecha'
    ordering = ('-fecha',)

@admin.register(RetiroEcoladrillo)
class RetiroEcoladrilloAdmin(admin.ModelAdmin):
    list_display = ('id_retiro', 'fecha', 'ecoladrillo', 'cantidad', 'motivo')
    search_fields = ('ecoladrillo__nombre', 'motivo')
    list_filter = ('fecha', 'ecoladrillo')
    date_hierarchy = 'fecha'
    ordering = ('-fecha',)

@admin.register(RegistroMaterial)
class RegistroMaterialAdmin(admin.ModelAdmin):
    list_display = ('id_registro_material', 'fecha', 'material', 'cantidad', 'origen')
    search_fields = ('material__nombre', 'origen')
    list_filter = ('fecha', 'material')
    date_hierarchy = 'fecha'
    ordering = ('-fecha',)

@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):
    list_display = ('id_reporte', 'tipo_reporte', 'fecha_generacion', 'operario')
    search_fields = ('tipo_reporte', 'operario__nombre')
    list_filter = ('tipo_reporte', 'fecha_generacion', 'operario')
    date_hierarchy = 'fecha_generacion'
    ordering = ('-fecha_generacion',)
    readonly_fields = ('fecha_generacion',)
    
    # Organizar los campos en el formulario
    fieldsets = (
        ('Información General', {
            'fields': ('tipo_reporte', 'operario', 'fecha_generacion')
        }),
        ('Datos del Reporte', {
            'fields': ('datos_reporte',),
            'classes': ('collapse',),  # Campo colapsable por defecto
        }),
    )
    
    # Filtros laterales mejorados
    list_filter = (
        'tipo_reporte',
        ('fecha_generacion', admin.DateFieldListFilter),
        'operario',
    )

@admin.register(ReporteStockFecha)
class ReporteStockFechaAdmin(admin.ModelAdmin):
    list_display = ('id_reporte', 'tipo_reporte', 'fecha_generacion', 'operario', 'fecha_consulta')
    search_fields = ('operario__nombre',)
    list_filter = ('fecha_generacion', 'fecha_consulta', 'operario')
    date_hierarchy = 'fecha_generacion'
    ordering = ('-fecha_generacion',)
    readonly_fields = ('fecha_generacion',)
    
    fieldsets = (
        ('Información General', {
            'fields': ('tipo_reporte', 'operario', 'fecha_generacion')
        }),
        ('Fecha de Consulta', {
            'fields': ('fecha_consulta',),
            'description': 'Fecha para la cual se consulta el stock de ecoladrillos y materiales.'
        }),
        ('Datos del Reporte', {
            'fields': ('datos_reporte',),
            'classes': ('collapse',),
        }),
    )

@admin.register(ReporteResumenInventario)
class ReporteResumenInventarioAdmin(admin.ModelAdmin):
    list_display = ('id_reporte', 'tipo_reporte', 'fecha_generacion', 'operario')
    search_fields = ('operario__nombre',)
    list_filter = ('fecha_generacion', 'operario')
    date_hierarchy = 'fecha_generacion'
    ordering = ('-fecha_generacion',)
    readonly_fields = ('fecha_generacion',)
    
    fieldsets = (
        ('Información General', {
            'fields': ('tipo_reporte', 'operario', 'fecha_generacion')
        }),
        ('Datos del Reporte', {
            'fields': ('datos_reporte',),
            'classes': ('collapse',),
            'description': 'Contiene el resumen de ecoladrillos y materiales sin stock.'
        }),
    )

@admin.register(ReporteResumenRetiros)
class ReporteResumenRetirosAdmin(admin.ModelAdmin):
    list_display = ('id_reporte', 'tipo_reporte', 'fecha_generacion', 'operario', 'get_periodo')
    search_fields = ('operario__nombre',)
    list_filter = ('fecha_generacion', 'fecha_inicio', 'fecha_fin', 'operario')
    date_hierarchy = 'fecha_generacion'
    ordering = ('-fecha_generacion',)
    readonly_fields = ('fecha_generacion',)
    
    def get_periodo(self, obj):
        """Muestra el período del reporte"""
        if obj.fecha_inicio and obj.fecha_fin:
            return f"{obj.fecha_inicio} - {obj.fecha_fin}"
        return "-"
    get_periodo.short_description = 'Período'
    
    fieldsets = (
        ('Información General', {
            'fields': ('tipo_reporte', 'operario', 'fecha_generacion')
        }),
        ('Período de Consulta', {
            'fields': ('fecha_inicio', 'fecha_fin'),
            'description': 'Período para el análisis de retiros de ecoladrillos.'
        }),
        ('Datos del Reporte', {
            'fields': ('datos_reporte',),
            'classes': ('collapse',),
        }),
    )


