"""
Pruebas para los endpoints de la API del sistema de inventario
"""
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth.models import User
from ..models import (
    Operario, Administrador, Material, Ecoladrillo, 
    RegistroMaterial, RegistroEcoladrillo
)


class EcoladrilloAPITest(APITestCase):
    """Pruebas para los endpoints de Ecoladrillo"""
    
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
            cantidad=15
        )
    
    def test_obtener_ecoladrillo_por_id(self):
        """Prueba obtener un ecoladrillo específico por ID"""
        url = f'/api/v1/ecoladrillos/{self.ecoladrillo.id_ecoladrillo}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Ecoladrillo Verde')
        self.assertEqual(response.data['cantidad'], 15)
    
    def test_stock_disponible_endpoint(self):
        """Prueba el endpoint de stock disponible"""
        url = f'/api/v1/ecoladrillos/{self.ecoladrillo.id_ecoladrillo}/stock_disponible/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['cantidad_disponible'], 15)
        self.assertEqual(response.data['nombre'], 'Ecoladrillo Verde')


class MaterialAPITest(APITestCase):
    """Pruebas para los endpoints de Material"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.material_con_stock = Material.objects.create(
            nombre="Cartón",
            tipo="Reciclado",
            cantidad_disponible=50,
            unidad_medida="kg"
        )
    
    def test_filtrar_por_tipo(self):
        """Prueba el endpoint de filtro por tipo"""
        url = '/api/v1/materiales/por_tipo/?tipo=Reciclado'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_filtrar_por_tipo_sin_parametro(self):
        """Prueba el endpoint de filtro por tipo sin parámetro"""
        url = '/api/v1/materiales/por_tipo/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_stock_disponible_endpoint(self):
        """Prueba el endpoint de materiales con stock disponible"""
        url = '/api/v1/materiales/stock_disponible/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)


class ReporteAPITest(APITestCase):
    """Pruebas para los endpoints de Reportes"""
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        self.operario = Operario.objects.create(
            nombre="Ana López",
            cargo="supervisor",
            email="ana@test.com",
            contraseña="test123"
        )
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
            cantidad=15
        )
    
    def test_generar_reporte_stock_fecha_valido(self):
        """Prueba generar un reporte de stock por fecha"""
        url = '/api/v1/reportes/generar_stock_fecha/'
        data = {
            'fecha': '2025-08-04',
            'operario_id': self.operario.id_usuario
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('reporte_id', response.data)
        self.assertIn('datos', response.data)
        self.assertEqual(response.data['operario']['nombre'], 'Ana López')
    
    def test_generar_reporte_sin_fecha(self):
        """Prueba generar un reporte sin fecha (debe fallar)"""
        url = '/api/v1/reportes/generar_stock_fecha/'
        data = {
            'operario_id': self.operario.id_usuario
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_generar_reporte_resumen_inventario(self):
        """Prueba generar un reporte de resumen de inventario"""
        url = '/api/v1/reportes/generar_resumen_inventario/'
        data = {
            'operario_id': self.operario.id_usuario
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('reporte_id', response.data)
        self.assertIn('datos', response.data)
    
    def test_operarios_disponibles_endpoint(self):
        """Prueba el endpoint de operarios disponibles"""
        url = '/api/v1/reportes/operarios_disponibles/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        
        # Verificar estructura de respuesta
        operario_data = response.data[0]
        self.assertIn('nombre', operario_data)
        self.assertIn('cargo', operario_data)
        self.assertIn('display', operario_data)
    
    def test_listar_reportes(self):
        """Prueba listar todos los reportes"""
        # Primero crear un reporte
        url_crear = '/api/v1/reportes/generar_stock_fecha/'
        data_crear = {
            'fecha': '2025-08-04',
            'operario_id': self.operario.id_usuario
        }
        self.client.post(url_crear, data_crear, format='json')
        
        # Luego listar reportes
        url_listar = '/api/v1/reportes/'
        response = self.client.get(url_listar)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
