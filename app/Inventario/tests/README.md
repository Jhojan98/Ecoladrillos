# Guía para Ejecutar las Pruebas

## Estructura de Pruebas Creadas

Se han creado las siguientes pruebas para el backend de tu sistema FIS - Inventario Ecoglobal:

### 📁 `/tests/`
- `__init__.py` - Inicialización del paquete de pruebas
- `test_basic_logic.py` - Pruebas básicas de lógica sin dependencias Django ✅
- `test_models.py` - Pruebas de modelos Django
- `test_api_endpoints.py` - Pruebas de endpoints de la API
- `test_integration.py` - Pruebas de integración entre componentes
- `test_config.py` - Configuración y datos de prueba

## 🚀 Cómo Ejecutar las Pruebas

### 1. Pruebas Básicas (✅ Recomendado - Siempre funciona)
```bash
# Dentro del contenedor Docker
docker compose exec web bash -c "cd Inventario/tests && python test_basic_logic.py"

# O directamente en el servidor
cd /usr/src/app/Inventario/tests
python test_basic_logic.py
```

### 2. Pruebas Completas de Django

#### Opción A - Comando Estándar (si MySQL tiene permisos)
```bash
# Dentro del contenedor Docker
docker compose exec web python manage.py test Inventario.tests --verbosity=2

# O directamente en el servidor  
cd /usr/src/app
python manage.py test Inventario.tests
```

#### Opción B - Con SQLite (Recomendado si hay problemas con MySQL)
```bash
# Dentro del contenedor Docker
docker compose exec web python -c "
import os, sys
sys.path.insert(0, '/usr/src/app')
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
import django
from django.conf import settings
settings.DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
django.setup()
from django.core.management import execute_from_command_line
execute_from_command_line(['manage.py', 'test', 'Inventario.tests.test_models', '--verbosity=2'])
"
```

### 3. Ejecutar Pruebas Específicas
```bash
# Solo pruebas de modelos
docker compose exec web python manage.py test Inventario.tests.test_models

# Solo pruebas de API (si MySQL funciona)
docker compose exec web python manage.py test Inventario.tests.test_api_endpoints

# Solo pruebas de integración
docker compose exec web python manage.py test Inventario.tests.test_integration

# Script alternativo para pruebas
docker compose exec web python simple_test_runner.py
```

### 4. Comandos con Mayor Detalle
```bash
# Con más información de salida
docker compose exec web python manage.py test Inventario.tests --verbosity=2

# Para mantener la base de datos de prueba (solo con MySQL)
docker compose exec web python manage.py test Inventario.tests --keepdb

# Ejecutar con configuración de prueba específica
docker compose exec web python manage.py test Inventario.tests --settings=Inventario.tests.test_settings
```

## 📊 Cobertura de Pruebas

### Endpoints Probados:
- ✅ **Ecoladrillos**: CRUD, stock bajo, stock disponible, reporte stock
- ✅ **Materiales**: CRUD, filtro por tipo, stock disponible, reporte stock
- ✅ **Operarios**: CRUD básico
- ✅ **Registros de Material**: Crear con actualización automática de stock
- ✅ **Retiros**: Listar, filtrar por fecha y ecoladrillo
- ✅ **Reportes**: Generar stock fecha, resumen inventario, operarios disponibles

### Modelos Probados:
- ✅ **Material**: Agregar/reducir stock, validaciones
- ✅ **Ecoladrillo**: Creación, relaciones
- ✅ **Operario**: Creación, representación string
- ✅ **RegistroMaterial**: Creación, relaciones
- ✅ **Reportes**: Creación de diferentes tipos

### Flujos de Integración:
- ✅ Registro de material → Actualización de stock
- ✅ Material → Ecoladrillo (relaciones)
- ✅ Generación de reportes con datos reales
- ✅ Flujos completos de inventario
- ✅ Identificación de stock bajo/sin stock

## 🛠️ Configuración Adicional

### Para usar con Coverage (Cobertura de Código):
```bash
# Dentro del contenedor Docker
docker compose exec web bash -c "
pip install coverage
coverage run --source='.' manage.py test Inventario.tests
coverage report
coverage html
"

# Ver el reporte HTML (se genera en htmlcov/)
docker compose exec web ls htmlcov/
```

### Para usar con pytest (Alternativa):
```bash
# Dentro del contenedor Docker
docker compose exec web bash -c "
pip install pytest-django
pytest Inventario/tests/ -v
"
```

### Script Personalizado de Pruebas:
```bash
# Ejecutar el script que maneja automáticamente las configuraciones
docker compose exec web python simple_test_runner.py

# O usar el script bash
docker compose exec web bash run_tests.sh
```

## 🔧 Notas Importantes

1. **Base de Datos de Prueba**: Django automáticamente crea y destruye una base de datos de prueba
2. **Datos Aislados**: Cada prueba se ejecuta en una transacción que se revierte automáticamente
3. **Configuración**: Las pruebas usan la configuración de `settings.py` pero con base de datos en memoria
4. **Orden**: Las pruebas se ejecutan en orden no determinístico

## ⚠️ Solución de Problemas

### Errores Comunes y Soluciones:

#### 1. **ImportError / ModuleNotFoundError**
```bash
# Problema: No module named 'app'
# Solución: Usar el comando correcto
❌ python manage.py test app.Inventario.tests
✅ python manage.py test Inventario.tests
```

#### 2. **Database Error - Access denied**
```bash
# Problema: (1044, "Access denied for user 'myuser'@'%' to database 'test_mydb'")
# Solución: Usar SQLite para pruebas
docker compose exec web python -c "
import os, sys
sys.path.insert(0, '/usr/src/app')
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
import django
from django.conf import settings
settings.DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
django.setup()
exec(open('/usr/src/app/Inventario/tests/test_basic_logic.py').read())
"
```

#### 3. **Permission Denied en MySQL**
```bash
# Opción A: Otorgar permisos (como root en MySQL)
GRANT ALL PRIVILEGES ON test_*.* TO 'myuser'@'%';
GRANT CREATE ON *.* TO 'myuser'@'%';
FLUSH PRIVILEGES;

# Opción B: Usar siempre SQLite para pruebas (más fácil)
# Ver comandos en sección "Opción B" arriba
```

#### 4. **Módulos Django no encontrados**
```bash
# Asegúrate de estar dentro del contenedor
docker compose exec web bash
cd /usr/src/app
python manage.py test Inventario.tests
```

#### 5. **Errores de Configuración**
```bash
# Usar la configuración de prueba específica
docker compose exec web python manage.py test Inventario.tests --settings=Inventario.tests.test_settings

# O usar el script que maneja la configuración automáticamente
docker compose exec web python simple_test_runner.py
```

### 🆘 Comandos de Emergencia (Siempre funcionan):

```bash
# 1. Pruebas básicas sin dependencias
docker compose exec web bash -c "cd Inventario/tests && python test_basic_logic.py"

# 2. Verificar que Django está disponible
docker compose exec web python -c "import django; print(f'Django {django.VERSION} disponible')"

# 3. Verificar estructura del proyecto
docker compose exec web ls -la Inventario/tests/

# 4. Script de pruebas simplificado
docker compose exec web python simple_test_runner.py
```

### 📋 Debugging de Entorno:
```bash
# Verificar variables de entorno
docker compose exec web printenv | grep DJANGO

# Verificar Python path
docker compose exec web python -c "import sys; print('\n'.join(sys.path))"

# Verificar módulos disponibles
docker compose exec web python -c "
try:
    import django; print('✅ Django disponible')
except: print('❌ Django NO disponible')
try:
    import rest_framework; print('✅ DRF disponible') 
except: print('❌ DRF NO disponible')
"
```

## 📈 Próximos Pasos

Para expandir las pruebas puedes:

1. Agregar pruebas de performance
2. Crear pruebas con datos masivos
3. Implementar pruebas de seguridad
4. Agregar pruebas de concurrencia
5. Crear pruebas de carga para los reportes

## 🎯 Ejemplo de Ejecución Exitosa

### Pruebas Básicas:
```bash
$ docker compose exec web bash -c "cd Inventario/tests && python test_basic_logic.py"
✅ Todas las pruebas básicas pasaron correctamente
```

### Pruebas Django (Exitosa):
```bash
$ docker compose exec web python manage.py test Inventario.tests.test_models --verbosity=2

Creating test database for alias 'default'...
Operations to perform:
  Synchronize unmigrated apps: staticfiles, rest_framework
  Apply all migrations: admin, auth, contenttypes, sessions, Inventario
Running migrations:
  Applying Inventario.0001_initial... OK

test_agregar_stock_valido (Inventario.tests.test_models.MaterialModelTest) ... ok
test_crear_material_valido (Inventario.tests.test_models.MaterialModelTest) ... ok
test_crear_ecoladrillo_valido (Inventario.tests.test_models.EcoladrilloModelTest) ... ok
test_crear_operario_valido (Inventario.tests.test_models.OperarioModelTest) ... ok
...

----------------------------------------------------------------------
Ran 15 tests in 1.234s

OK
Destroying test database for alias 'default'...
```

### Ejemplo con SQLite (Cuando hay problemas con MySQL):
```bash
$ docker compose exec web python simple_test_runner.py

🧪 Ejecutando pruebas del sistema FIS - Inventario Ecoglobal
============================================================

📝 Ejecutando pruebas básicas...
✅ Todas las pruebas básicas pasaron correctamente
✅ Pruebas básicas completadas

🔧 Ejecutando pruebas de Django...
✅ Pruebas de modelos completadas exitosamente

🎯 Ejecución de pruebas completada!
```

## 📚 Archivos de Soporte Creados

- `simple_test_runner.py` - Script Python que maneja configuración automáticamente
- `test_settings.py` - Configuración específica para pruebas con SQLite
- `run_tests.sh` - Script bash para ejecutar pruebas
- `SOLUCION_PRUEBAS.md` - Guía detallada de solución de problemas

## 🔗 Referencias Adicionales

- Consulta `../SOLUCION_PRUEBAS.md` para más detalles sobre problemas específicos
- Revisa `../simple_test_runner.py` para entender la configuración automática
- Ver `test_settings.py` para configuración personalizada de pruebas
