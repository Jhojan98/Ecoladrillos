"""
Configuración de pruebas para el proyecto
"""
# Removidas las importaciones de Django para evitar errores de configuración


class TestConfiguration:
    """Configuración base para todas las pruebas"""
    
    @staticmethod
    def setup_test_data():
        """Método para configurar datos de prueba básicos"""
        pass
    
    @staticmethod
    def cleanup_test_data():
        """Método para limpiar datos de prueba"""
        pass


# Datos de prueba comunes
TEST_MATERIALS = [
    {
        'nombre': 'Plástico PET',
        'tipo': 'Reciclado',
        'cantidad_disponible': 100
    },
    {
        'nombre': 'Cartón',
        'tipo': 'Reciclado',
        'cantidad_disponible': 50
    },
    {
        'nombre': 'Vidrio',
        'tipo': 'Reciclado',
        'cantidad_disponible': 0
    }
]

TEST_OPERARIOS = [
    {
        'nombre': 'Juan Pérez',
        'cargo': 'operario'
    },
    {
        'nombre': 'María García',
        'cargo': 'supervisor'
    },
    {
        'nombre': 'Ana López',
        'cargo': 'administrador'
    }
]

TEST_ECOLADRILLOS = [
    {
        'nombre': 'Ecoladrillo Verde',
        'cantidad': 25
    },
    {
        'nombre': 'Ecoladrillo Azul',
        'cantidad': 15
    },
    {
        'nombre': 'Ecoladrillo Rojo',
        'cantidad': 5  # Stock bajo
    }
]
