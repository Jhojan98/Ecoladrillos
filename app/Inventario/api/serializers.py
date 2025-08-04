from rest_framework import serializers
from ..models import (
    Operario, Administrador, Ecoladrillo, Material, 
    RegistroEcoladrillo, RetiroEcoladrillo, RegistroMaterial, Reporte,
    ReporteStockFecha, ReporteResumenInventario, ReporteResumenRetiros
)

class OperarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operario
        fields = ['id_usuario', 'nombre', 'email', 'cargo']
        extra_kwargs = {
            'contraseña': {'write_only': True}  # No mostrar contraseña en respuestas
        }

class AdministradorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administrador
        fields = ['id_usuario', 'nombre', 'email']
        extra_kwargs = {
            'contraseña': {'write_only': True}
        }

class EcoladrilloSerializer(serializers.ModelSerializer):
    material_principal_nombre = serializers.CharField(source='material_principal.nombre', read_only=True)
    size_display = serializers.CharField(source='get_size_display', read_only=True)
    
    class Meta:
        model = Ecoladrillo
        fields = ['id_ecoladrillo', 'nombre', 'descripcion', 'size', 'size_display', 
                 'material_principal', 'material_principal_nombre', 'cantidad_material_requerida', 'cantidad']

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id_insumo', 'nombre', 'tipo', 'cantidad_disponible', 'unidad_medida']

class RegistroEcoladrilloSerializer(serializers.ModelSerializer):
    ecoladrillo_nombre = serializers.CharField(source='ecoladrillo.nombre', read_only=True)
    
    class Meta:
        model = RegistroEcoladrillo
        fields = ['id_registro', 'fecha', 'ecoladrillo', 'ecoladrillo_nombre', 'cantidad']

class RetiroEcoladrilloSerializer(serializers.ModelSerializer):
    ecoladrillo_nombre = serializers.CharField(source='ecoladrillo.nombre', read_only=True)
    
    class Meta:
        model = RetiroEcoladrillo
        fields = ['id_retiro', 'fecha', 'ecoladrillo', 'cantidad', 'motivo', 'ecoladrillo_nombre']

class RegistroMaterialSerializer(serializers.ModelSerializer):
    material_nombre = serializers.CharField(source='material.nombre', read_only=True)
    
    class Meta:
        model = RegistroMaterial
        fields = ['id_registro_material', 'fecha', 'cantidad', 
                 'material', 'material_nombre', 'origen']

class ReporteSerializer(serializers.ModelSerializer):
    operario_nombre = serializers.CharField(source='operario.nombre', read_only=True)
    tipo_reporte_display = serializers.CharField(source='get_tipo_reporte_display', read_only=True)
    
    class Meta:
        model = Reporte
        fields = ['id_reporte', 'tipo_reporte', 'tipo_reporte_display', 'fecha_generacion', 
                 'operario', 'operario_nombre', 'datos_reporte']
        read_only_fields = ['fecha_generacion']

class ReporteStockFechaSerializer(serializers.ModelSerializer):
    operario_nombre = serializers.CharField(source='operario.nombre', read_only=True)
    tipo_reporte_display = serializers.CharField(source='get_tipo_reporte_display', read_only=True)
    ecoladrillos_sin_stock = serializers.SerializerMethodField()
    materiales_sin_stock = serializers.SerializerMethodField()
    todos_ecoladrillos = serializers.SerializerMethodField()
    todos_materiales = serializers.SerializerMethodField()
    
    class Meta:
        model = ReporteStockFecha
        fields = ['id_reporte', 'tipo_reporte', 'tipo_reporte_display', 'fecha_generacion', 
                 'operario', 'operario_nombre', 'fecha_consulta', 'datos_reporte',
                 'ecoladrillos_sin_stock', 'materiales_sin_stock', 'todos_ecoladrillos', 'todos_materiales']
        read_only_fields = ['fecha_generacion']
    
    def get_ecoladrillos_sin_stock(self, obj):
        return obj.obtener_ecoladrillos_sin_stock()
    
    def get_materiales_sin_stock(self, obj):
        return obj.obtener_materiales_sin_stock()
    
    def get_todos_ecoladrillos(self, obj):
        return obj.obtener_todos_ecoladrillos()
    
    def get_todos_materiales(self, obj):
        return obj.obtener_todos_materiales()

class ReporteResumenInventarioSerializer(serializers.ModelSerializer):
    operario_nombre = serializers.CharField(source='operario.nombre', read_only=True)
    tipo_reporte_display = serializers.CharField(source='get_tipo_reporte_display', read_only=True)
    ecoladrillos_sin_stock = serializers.SerializerMethodField()
    materiales_sin_stock = serializers.SerializerMethodField()
    ecoladrillos_con_stock = serializers.SerializerMethodField()
    materiales_con_stock = serializers.SerializerMethodField()
    resumen_estadisticas = serializers.SerializerMethodField()
    
    class Meta:
        model = ReporteResumenInventario
        fields = ['id_reporte', 'tipo_reporte', 'tipo_reporte_display', 'fecha_generacion', 
                 'operario', 'operario_nombre', 'datos_reporte',
                 'ecoladrillos_sin_stock', 'materiales_sin_stock', 
                 'ecoladrillos_con_stock', 'materiales_con_stock', 'resumen_estadisticas']
        read_only_fields = ['fecha_generacion']
    
    def get_ecoladrillos_sin_stock(self, obj):
        return obj.obtener_ecoladrillos_sin_stock()
    
    def get_materiales_sin_stock(self, obj):
        return obj.obtener_materiales_sin_stock()
    
    def get_ecoladrillos_con_stock(self, obj):
        if 'ecoladrillos_con_stock' in obj.datos_reporte:
            return obj.datos_reporte['ecoladrillos_con_stock']
        return []
    
    def get_materiales_con_stock(self, obj):
        if 'materiales_con_stock' in obj.datos_reporte:
            return obj.datos_reporte['materiales_con_stock']
        return []
    
    def get_resumen_estadisticas(self, obj):
        if 'resumen' in obj.datos_reporte:
            return obj.datos_reporte['resumen']
        return {}

class ReporteResumenRetirosSerializer(serializers.ModelSerializer):
    operario_nombre = serializers.CharField(source='operario.nombre', read_only=True)
    tipo_reporte_display = serializers.CharField(source='get_tipo_reporte_display', read_only=True)
    retiros_detalle = serializers.SerializerMethodField()
    resumen_por_ecoladrillo = serializers.SerializerMethodField()
    estadisticas = serializers.SerializerMethodField()
    periodo_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ReporteResumenRetiros
        fields = ['id_reporte', 'tipo_reporte', 'tipo_reporte_display', 'fecha_generacion', 
                 'operario', 'operario_nombre', 'fecha_inicio', 'fecha_fin', 'datos_reporte',
                 'retiros_detalle', 'resumen_por_ecoladrillo', 'estadisticas', 'periodo_info']
        read_only_fields = ['fecha_generacion']
    
    def get_retiros_detalle(self, obj):
        if 'retiros' in obj.datos_reporte:
            return obj.datos_reporte['retiros']
        return []
    
    def get_resumen_por_ecoladrillo(self, obj):
        if 'resumen_por_ecoladrillo' in obj.datos_reporte:
            return obj.datos_reporte['resumen_por_ecoladrillo']
        return []
    
    def get_estadisticas(self, obj):
        if 'estadisticas' in obj.datos_reporte:
            return obj.datos_reporte['estadisticas']
        return {}
    
    def get_periodo_info(self, obj):
        if 'periodo' in obj.datos_reporte:
            return obj.datos_reporte['periodo']
        return {
            'fecha_inicio': obj.fecha_inicio.isoformat() if obj.fecha_inicio else None,
            'fecha_fin': obj.fecha_fin.isoformat() if obj.fecha_fin else None
        }
