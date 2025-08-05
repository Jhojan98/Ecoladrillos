"""
Pruebas para los modelos del sistema de inventario
"""
from django.test import TestCase
from django.core.exceptions import ValidationError
from ..models import (
    Operario, Administrador, Material, Ecoladrillo, 
    RegistroMaterial, RegistroEcoladrillo, RetiroEcoladrillo,
    ReporteStockFecha, ReporteResumenInventario
)


class MaterialModelTest(TestCase):
    """Pruebas para el modelo Material"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.material = Material.objects.create(
            nombre="Plástico PET",
            tipo="Reciclado",
            cantidad_disponible=100,
            unidad_medida="kg"
        )
    
    def test_crear_material_valido(self):
        """Prueba crear un material con datos válidos"""
        material = Material.objects.create(
            nombre="Cartón",
            tipo="Reciclado",
            cantidad_disponible=50,
            unidad_medida="kg"
        )
        self.assertEqual(material.nombre, "Cartón")
        self.assertEqual(material.tipo, "Reciclado")
        self.assertEqual(material.cantidad_disponible, 50)
    
    def test_agregar_stock_valido(self):
        """Prueba agregar stock válido al material"""
        cantidad_inicial = self.material.cantidad_disponible
        self.material.agregar_stock(25)
        self.assertEqual(self.material.cantidad_disponible, cantidad_inicial + 25)
    
    def test_agregar_stock_negativo_falla(self):
        """Prueba que no se puede agregar stock negativo"""
        with self.assertRaises(ValueError):
            self.material.agregar_stock(-10)
    
    def test_reducir_stock_suficiente(self):
        """Prueba reducir stock cuando hay cantidad suficiente"""
        cantidad_inicial = self.material.cantidad_disponible
        self.material.reducir_stock(30)
        self.assertEqual(self.material.cantidad_disponible, cantidad_inicial - 30)
    
    def test_reducir_stock_insuficiente_falla(self):
        """Prueba que falla al reducir más stock del disponible"""
        with self.assertRaises(ValueError):
            self.material.reducir_stock(150)


class EcoladrilloModelTest(TestCase):
    """Pruebas para el modelo Ecoladrillo"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.material = Material.objects.create(
            nombre="Plástico PET",
            tipo="Reciclado",
            cantidad_disponible=100,
            unidad_medida="kg"
        )
        self.ecoladrillo = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Verde",
            descripcion="Ecoladrillo de prueba",
            material_principal=self.material,
            cantidad=20
        )
    
    def test_crear_ecoladrillo_valido(self):
        """Prueba crear un ecoladrillo con datos válidos"""
        ecoladrillo = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Azul",
            descripcion="Otro ecoladrillo de prueba",
            material_principal=self.material,
            cantidad=15
        )
        self.assertEqual(ecoladrillo.nombre, "Ecoladrillo Azul")
        self.assertEqual(ecoladrillo.material_principal, self.material)
        self.assertEqual(ecoladrillo.cantidad, 15)


class OperarioModelTest(TestCase):
    """Pruebas para el modelo Operario"""
    
    def test_crear_operario_valido(self):
        """Prueba crear un operario con datos válidos"""
        operario = Operario.objects.create(
            nombre="Juan Pérez",
            cargo="operario",
            email="juan@test.com",
            contraseña="test123"
        )
        self.assertEqual(operario.nombre, "Juan Pérez")
        self.assertEqual(operario.cargo, "operario")
    
    def test_string_representation(self):
        """Prueba la representación en string del operario"""
        operario = Operario.objects.create(
            nombre="María García",
            cargo="supervisor",
            email="maria@test.com",
            contraseña="test123"
        )
        expected = "María García - supervisor"
        self.assertEqual(str(operario), expected)


class RegistroMaterialModelTest(TestCase):
    """Pruebas para el modelo RegistroMaterial"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.material = Material.objects.create(
            nombre="Aluminio",
            tipo="Metal",
            cantidad_disponible=50,
            unidad_medida="kg"
        )
    
    def test_crear_registro_material_valido(self):
        """Prueba crear un registro de material válido"""
        registro = RegistroMaterial.objects.create(
            fecha="2025-08-04",
            cantidad=25,
            material=self.material,
            origen="Compra"
        )
        self.assertEqual(registro.cantidad, 25)
        self.assertEqual(registro.material, self.material)
        self.assertEqual(registro.origen, "Compra")


class ReporteModelTest(TestCase):
    """Pruebas para los modelos de Reporte"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.operario = Operario.objects.create(
            nombre="Ana López",
            cargo="supervisor",
            email="ana@test.com",
            contraseña="test123"
        )
    
    def test_crear_reporte_stock_fecha(self):
        """Prueba crear un reporte de stock por fecha"""
        reporte = ReporteStockFecha.objects.create(
            tipo_reporte='stock_fecha',
            operario=self.operario,
            fecha_consulta='2025-08-04',
            datos_reporte={}
        )
        self.assertEqual(reporte.tipo_reporte, 'stock_fecha')
        self.assertEqual(reporte.operario, self.operario)
        self.assertIsNotNone(reporte.fecha_generacion)
    
    def test_crear_reporte_resumen_inventario(self):
        """Prueba crear un reporte de resumen de inventario"""
        reporte = ReporteResumenInventario.objects.create(
            tipo_reporte='resumen_inventario',
            operario=self.operario,
            datos_reporte={}
        )
        self.assertEqual(reporte.tipo_reporte, 'resumen_inventario')
        self.assertEqual(reporte.operario, self.operario)
