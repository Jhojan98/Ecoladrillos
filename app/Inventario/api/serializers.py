from rest_framework import serializers
from django.conf import settings
from ..models import (
    Ecoladrillo, Material, 
    RegistroEcoladrillo, RetiroEcoladrillo, RegistroMaterial, Reporte
)

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
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = RegistroEcoladrillo
        fields = ['id_registro', 'fecha', 'ecoladrillo', 'ecoladrillo_nombre', 'cantidad', 
                 'usuario', 'usuario_nombre', 'usuario_username']
        read_only_fields = ['usuario']  # Se asigna automáticamente

class RetiroEcoladrilloSerializer(serializers.ModelSerializer):
    ecoladrillo_nombre = serializers.CharField(source='ecoladrillo.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = RetiroEcoladrillo
        fields = ['id_retiro', 'fecha', 'ecoladrillo', 'cantidad', 'motivo', 'ecoladrillo_nombre',
                 'usuario', 'usuario_nombre', 'usuario_username']
        read_only_fields = ['usuario']  # Se asigna automáticamente

class RegistroMaterialSerializer(serializers.ModelSerializer):
    material_nombre = serializers.CharField(source='material.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = RegistroMaterial
        fields = ['id_registro_material', 'id_ingreso', 'fecha', 'cantidad', 
                 'material', 'material_nombre', 'origen', 
                 'usuario', 'usuario_nombre', 'usuario_username']
        read_only_fields = ['usuario']  # Se asigna automáticamente

class ReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reporte
        fields = ['id_reporte', 'fecha_generacion', 'fecha_inicio', 'fecha_fin']
