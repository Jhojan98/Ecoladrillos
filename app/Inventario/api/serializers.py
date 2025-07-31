from rest_framework import serializers
from ..models import (
    Operario, Administrador, Ecoladrillo, Material, 
    RegistroEcoladrillo, RetiroEcoladrillo, RegistroMaterial, Reporte
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
        fields = ['id_registro_material', 'id_ingreso', 'fecha', 'cantidad', 
                 'material', 'material_nombre', 'origen']

class ReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reporte
        fields = ['id_reporte', 'fecha_generacion', 'fecha_inicio', 'fecha_fin']
