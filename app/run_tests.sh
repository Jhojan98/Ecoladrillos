#!/bin/bash

# Script para ejecutar las pruebas del sistema FIS

echo "🧪 Ejecutando pruebas del sistema FIS - Inventario Ecoglobal"
echo "================================================================"

# Cambiar al directorio del proyecto
cd /usr/src/app

echo "📍 Directorio actual: $(pwd)"
echo "📂 Contenido del directorio:"
ls -la

echo ""
echo "🔧 Verificando estructura del proyecto..."
if [ -d "Inventario" ]; then
    echo "✅ Directorio Inventario encontrado"
else
    echo "❌ Directorio Inventario NO encontrado"
    exit 1
fi

if [ -d "Inventario/tests" ]; then
    echo "✅ Directorio de pruebas encontrado"
else
    echo "❌ Directorio de pruebas NO encontrado"
    exit 1
fi

echo ""
echo "🧪 Ejecutando pruebas básicas (sin Django)..."
cd Inventario/tests
python test_basic_logic.py

echo ""
echo "🔄 Regresando al directorio principal..."
cd /usr/src/app

echo ""
echo "🧪 Ejecutando pruebas de Django con SQLite..."
echo "   (Usando base de datos en memoria para evitar problemas de permisos)"

# Opción 1: Intentar con configuración personalizada
echo "🔧 Intentando con configuración personalizada de pruebas..."
export DJANGO_SETTINGS_MODULE=core.settings
python -c "
import os, sys
sys.path.append('/usr/src/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
from django.conf import settings

# Configurar base de datos en memoria para pruebas
settings.DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

django.setup()

# Ejecutar pruebas
from django.test.utils import get_runner
from django.test.runner import DiscoverRunner

test_runner = DiscoverRunner(verbosity=2, interactive=False, keepdb=False)
failures = test_runner.run_tests(['Inventario.tests'])

if failures:
    print(f'❌ {failures} pruebas fallaron')
    sys.exit(1)
else:
    print('✅ Todas las pruebas pasaron correctamente')
"

echo ""
echo "🎯 Pruebas completadas!"
