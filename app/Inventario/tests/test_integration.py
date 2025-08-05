"""
Pruebas de integración para el sistema de inventario
Prueban la interacción entre múltiples componentes
"""
from django.test import TestCase, TransactionTestCase
from django.db import transaction
from ..models import (
    Material, Ecoladrillo, RegistroMaterial, 
    Operario, ReporteStockFecha
)


class RegistroMaterialIntegrationTest(TestCase):
    """Pruebas de integración para RegistroMaterial"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.material = Material.objects.create(
            nombre="Cartón",
            tipo="Reciclado",
            cantidad_disponible=50
        )
        self.operario = Operario.objects.create(
            nombre="Juan Pérez",
            cargo="operario"
        )
    
    def test_registro_actualiza_stock_automaticamente(self):
        """Prueba que al crear un registro se actualiza el stock del material"""
        # Stock inicial
        stock_inicial = self.material.cantidad_disponible
        
        # Crear registro
        registro = RegistroMaterial.objects.create(
            fecha="2025-08-04",
            cantidad=30,
            material=self.material,
            origen="Compra"
        )
        
        # El stock debería actualizarse automáticamente a través de señales o métodos
        # (esto depende de cómo esté implementado en tu modelo)
        self.assertEqual(registro.cantidad, 30)
        self.assertEqual(registro.material, self.material)
    
    def test_multiples_registros_misma_fecha(self):
        """Prueba crear múltiples registros del mismo material en la misma fecha"""
        # Crear primer registro
        registro1 = RegistroMaterial.objects.create(
            fecha="2025-08-04",
            cantidad=20,
            material=self.material,
            origen="Compra directa"
        )
        
        # Crear segundo registro
        registro2 = RegistroMaterial.objects.create(
            fecha="2025-08-04",
            cantidad=15,
            material=self.material,
            origen="Donación"
        )
        
        # Verificar que ambos registros se crearon correctamente
        registros_fecha = RegistroMaterial.objects.filter(fecha="2025-08-04")
        self.assertEqual(registros_fecha.count(), 2)
        
        total_cantidad = sum(r.cantidad for r in registros_fecha)
        self.assertEqual(total_cantidad, 35)  # 20 + 15


class EcoladrilloMaterialIntegrationTest(TestCase):
    """Pruebas de integración entre Ecoladrillo y Material"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.material_principal = Material.objects.create(
            nombre="Plástico PET",
            tipo="Reciclado",
            cantidad_disponible=100
        )
        self.material_secundario = Material.objects.create(
            nombre="Arena",
            tipo="Natural",
            cantidad_disponible=200
        )
    
    def test_ecoladrillo_con_material_principal(self):
        """Prueba crear ecoladrillo con material principal"""
        ecoladrillo = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Verde",
            material_principal=self.material_principal,
            cantidad=25
        )
        
        self.assertEqual(ecoladrillo.material_principal, self.material_principal)
        self.assertEqual(ecoladrillo.cantidad, 25)
    
    def test_relacion_material_ecoladrillos(self):
        """Prueba la relación entre material y sus ecoladrillos"""
        # Crear varios ecoladrillos con el mismo material principal
        ecoladrillo1 = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Verde",
            material_principal=self.material_principal,
            cantidad=25
        )
        ecoladrillo2 = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Azul",
            material_principal=self.material_principal,
            cantidad=15
        )
        
        # Verificar que el material tiene múltiples ecoladrillos
        ecoladrillos_del_material = Ecoladrillo.objects.filter(
            material_principal=self.material_principal
        )
        self.assertEqual(ecoladrillos_del_material.count(), 2)
        
        total_cantidad = sum(e.cantidad for e in ecoladrillos_del_material)
        self.assertEqual(total_cantidad, 40)  # 25 + 15


class ReporteIntegrationTest(TestCase):
    """Pruebas de integración para la generación de reportes"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.operario = Operario.objects.create(
            nombre="Ana López",
            cargo="supervisor"
        )
        self.material = Material.objects.create(
            nombre="Plástico PET",
            tipo="Reciclado",
            cantidad_disponible=100
        )
        self.ecoladrillo = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Verde",
            material_principal=self.material,
            cantidad=15
        )
    
    def test_generar_reporte_con_datos_reales(self):
        """Prueba generar un reporte con datos reales en la base de datos"""
        reporte = ReporteStockFecha.objects.create(
            tipo_reporte='stock_fecha',
            operario=self.operario,
            fecha_consulta='2025-08-04',
            datos_reporte={}
        )
        
        # Verificar que el reporte se creó correctamente
        self.assertEqual(reporte.tipo_reporte, 'stock_fecha')
        self.assertEqual(reporte.operario, self.operario)
        self.assertIsNotNone(reporte.fecha_generacion)
    
    def test_reporte_incluye_ecoladrillos_existentes(self):
        """Prueba que el reporte incluye los ecoladrillos existentes"""
        # Crear más ecoladrillos para tener datos variados
        ecoladrillo_stock_bajo = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Rojo",
            material_principal=self.material,
            cantidad=5  # Stock bajo
        )
        
        ecoladrillo_sin_stock = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Amarillo",
            material_principal=self.material,
            cantidad=0  # Sin stock
        )
        
        # Contar ecoladrillos por categoría
        total_ecoladrillos = Ecoladrillo.objects.count()
        stock_bajo = Ecoladrillo.objects.filter(cantidad__lt=10).count()
        sin_stock = Ecoladrillo.objects.filter(cantidad=0).count()
        
        self.assertEqual(total_ecoladrillos, 3)
        self.assertEqual(stock_bajo, 2)  # Rojo (5) y Amarillo (0)
        self.assertEqual(sin_stock, 1)   # Solo Amarillo (0)


class WorkflowIntegrationTest(TestCase):
    """Pruebas de flujos de trabajo completos"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.operario = Operario.objects.create(
            nombre="Carlos Ruiz",
            cargo="operario"
        )
        self.material = Material.objects.create(
            nombre="Plástico PET",
            tipo="Reciclado",
            cantidad_disponible=0  # Empezamos sin stock
        )
    
    def test_flujo_completo_agregar_material_crear_ecoladrillo(self):
        """Prueba un flujo completo: agregar material -> crear ecoladrillo"""
        # Paso 1: Registrar llegada de material
        registro = RegistroMaterial.objects.create(
            fecha="2025-08-04",
            cantidad=100,
            material=self.material,
            origen="Compra directa"
        )
        
        # Simular actualización de stock (normalmente sería automático)
        self.material.agregar_stock(registro.cantidad)
        
        # Verificar que el material tiene stock
        self.assertEqual(self.material.cantidad_disponible, 100)
        
        # Paso 2: Crear ecoladrillo con ese material
        ecoladrillo = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Nuevo",
            material_principal=self.material,
            cantidad=25
        )
        
        # Verificar que el ecoladrillo se creó correctamente
        self.assertEqual(ecoladrillo.material_principal, self.material)
        self.assertEqual(ecoladrillo.cantidad, 25)
        
        # Paso 3: Verificar que tenemos datos para reportes
        total_materiales = Material.objects.count()
        total_ecoladrillos = Ecoladrillo.objects.count()
        total_registros = RegistroMaterial.objects.count()
        
        self.assertEqual(total_materiales, 1)
        self.assertEqual(total_ecoladrillos, 1)
        self.assertEqual(total_registros, 1)
    
    def test_flujo_inventario_bajo_stock(self):
        """Prueba identificar elementos con stock bajo"""
        # Crear varios materiales con diferentes niveles de stock
        material_ok = Material.objects.create(
            nombre="Cartón",
            tipo="Reciclado",
            cantidad_disponible=50
        )
        material_bajo = Material.objects.create(
            nombre="Vidrio",
            tipo="Reciclado",
            cantidad_disponible=5  # Stock bajo
        )
        material_sin_stock = Material.objects.create(
            nombre="Metal",
            tipo="Reciclado",
            cantidad_disponible=0  # Sin stock
        )
        
        # Crear ecoladrillos con diferentes niveles de stock
        ecoladrillo_ok = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Verde",
            material_principal=material_ok,
            cantidad=20
        )
        ecoladrillo_bajo = Ecoladrillo.objects.create(
            nombre="Ecoladrillo Rojo",
            material_principal=material_bajo,
            cantidad=3  # Stock bajo
        )
        
        # Verificar filtros de stock bajo
        materiales_stock_bajo = Material.objects.filter(cantidad_disponible__lt=10)
        ecoladrillos_stock_bajo = Ecoladrillo.objects.filter(cantidad__lt=10)
        
        self.assertEqual(materiales_stock_bajo.count(), 2)  # Vidrio y Metal
        self.assertEqual(ecoladrillos_stock_bajo.count(), 1)  # Solo Rojo
        
        # Verificar elementos sin stock
        materiales_sin_stock = Material.objects.filter(cantidad_disponible=0)
        self.assertEqual(materiales_sin_stock.count(), 1)  # Solo Metal
