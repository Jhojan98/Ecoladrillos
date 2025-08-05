# Guía de Solución para Problemas de Pruebas

## ❌ Problemas Identificados:

1. **Comando incorrecto**: `app.Inventario.tests` → debe ser `Inventario.tests`
2. **Permisos MySQL**: El usuario no puede crear base de datos de prueba
3. **Configuración Docker**: Problemas con el entorno containerizado

## ✅ Soluciones:

### 1. Ejecutar Pruebas Básicas (Garantizado que funciona)
```bash
cd /usr/src/app/Inventario/tests
python test_basic_logic.py
```

### 2. Comando Correcto para Django
```bash
cd /usr/src/app
python manage.py test Inventario.tests
```

### 3. Usar SQLite para Pruebas (Evita problemas MySQL)
```bash
cd /usr/src/app
python manage.py test Inventario.tests --settings=Inventario.tests.test_settings
```

### 4. Ejecutar Solo Pruebas de Modelos
```bash
python manage.py test Inventario.tests.test_models --verbosity=2
```

### 5. Alternativa con Override de DB
```bash
python -c "
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
import django
from django.conf import settings
settings.DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
django.setup()
from django.test.utils import get_runner
TestRunner = get_runner(settings)
test_runner = TestRunner(verbosity=2)
test_runner.run_tests(['Inventario.tests.test_basic_logic'])
"
```

### 6. Script Simplificado
```bash
cd /usr/src/app
python simple_test_runner.py
```

## 🔧 Solución Permanente para MySQL:

### Opción A: Otorgar Permisos al Usuario
```sql
-- Conectarse como root a MySQL
GRANT ALL PRIVILEGES ON test_mydb.* TO 'myuser'@'%';
GRANT CREATE ON *.* TO 'myuser'@'%';
FLUSH PRIVILEGES;
```

### Opción B: Configurar Usuario de Pruebas
En `settings.py` agregar:
```python
import sys
if 'test' in sys.argv:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
```

### Opción C: Variables de Entorno
```bash
export DJANGO_TEST_DB_ENGINE=django.db.backends.sqlite3
export DJANGO_TEST_DB_NAME=:memory:
```

## 🎯 Comandos Recomendados (En orden de probabilidad de éxito):

```bash
# 1. Pruebas básicas (100% funciona)
cd /usr/src/app/Inventario/tests && python test_basic_logic.py

# 2. Solo modelos con SQLite
cd /usr/src/app && python -c "
import sys, os
sys.path.insert(0, '/usr/src/app')
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
import django
from django.conf import settings
settings.DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
django.setup()
exec(open('simple_test_runner.py').read())
"

# 3. Comando directo simple
cd /usr/src/app && python manage.py test Inventario.tests.test_basic_logic

# 4. Si MySQL funciona
cd /usr/src/app && python manage.py test Inventario.tests --keepdb
```

## 📋 Verificación del Entorno:
```bash
cd /usr/src/app
python -c "
import sys
print('Python path:', sys.path)
print('Current dir:', '/usr/src/app' in sys.path)
try:
    import django
    print('Django:', django.VERSION)
except: print('Django: NO DISPONIBLE')
try:
    import rest_framework
    print('DRF: DISPONIBLE')
except: print('DRF: NO DISPONIBLE')
"
```
