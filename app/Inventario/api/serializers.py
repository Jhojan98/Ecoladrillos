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
    class Meta:
        model = Ecoladrillo
        fields = ['id_ecoladrillo', 'nombre', 'descripcion', 'cantidad']

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id_insumo', 'nombre', 'tipo', 'cantidad_disponible', 'unidad_medida', 'cantidad_para_ecoladrillo']

class RegistroEcoladrilloSerializer(serializers.ModelSerializer):
    material_usado_nombre = serializers.CharField(source='material_usado.nombre', read_only=True)
    
    class Meta:
        model = RegistroEcoladrillo
        fields = ['id_registro', 'fecha', 'ecoladrillo', 'cantidad', 'material_usado', 'material_usado_nombre']

class RetiroEcoladrilloSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetiroEcoladrillo
        fields = ['id_retiro', 'fecha', 'cantidad', 'motivo']

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
