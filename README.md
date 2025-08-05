# 🐳 Proyecto Django + MySQL (Dockerizado)

Este proyecto es una aplicación web de inventario construida con **Django** y **MySQL**, lista para desarrollo en contenedores Docker. A continuación, te explicamos cómo ponerlo en marcha paso a paso.

---

## 📦 Requisitos Previos

Asegúrate de tener instalados:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Git

---

## 📁 Estructura del Proyecto

```
.
├── conf/
│   └── .env
├── docker-compose.yml
├── dockerfile
├── docker-entrypoint.sh
├── src/
│   ├── core/
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
```

---

## ⚙️ 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/proyecto.git
cd proyecto
```

## 🚀 3. Levantar los contenedores

Desde la raíz del proyecto, ejecuta:

```bash
docker compose --env-file .env.dev up --build
```

Esto hará lo siguiente:

- Construirá el contenedor Django
- Esperará automáticamente a que MySQL esté listo
- Aplicará migraciones automáticamente
- Iniciará el servidor en `http://localhost:8000`

---

## 🧪 4. Verificar que el proyecto esté corriendo

Abre tu navegador en:

```url
http://localhost:8000
```

---

## 🔑 5. Acceder al panel de administración

### Crear un superusuario

```bash
docker compose exec web python manage.py createsuperuser
```

Sigue las instrucciones para establecer usuario y contraseña.

### Ingresar al panel

```url
http://localhost:8000/admin
```

---

## 🧪 6. Ejecutar Pruebas

Este proyecto incluye un conjunto completo de pruebas para garantizar la calidad del código.

### Pruebas Básicas (Recomendado - Siempre funciona)

```bash
# Ejecutar pruebas de lógica básica
docker compose exec web bash -c "cd Inventario/tests && python test_basic_logic.py"
```

### Pruebas Completas de Django

```bash
# Opción 1: Comando estándar
docker compose exec web python manage.py test Inventario.tests --verbosity=2

# Opción 2: Solo pruebas de modelos
docker compose exec web python manage.py test Inventario.tests.test_models --verbosity=2

# Opción 3: Con SQLite (evita problemas de permisos MySQL)
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

### Pruebas Específicas

```bash
# Solo pruebas de API endpoints
docker compose exec web python manage.py test Inventario.tests.test_api_endpoints

# Solo pruebas de integración
docker compose exec web python manage.py test Inventario.tests.test_integration

# Con cobertura de código (si tienes coverage instalado)
docker compose exec web coverage run --source='.' manage.py test Inventario.tests
docker compose exec web coverage report
```

### 📊 Cobertura de Pruebas

Las pruebas cubren:
- ✅ **Modelos**: Validaciones, métodos, relaciones
- ✅ **API Endpoints**: CRUD, filtros, acciones personalizadas
- ✅ **Reportes**: Generación de todos los tipos de reportes
- ✅ **Integración**: Flujos completos del sistema
- ✅ **Validaciones**: Manejo de errores y casos edge

### 🔧 Solución de Problemas con Pruebas

Si encuentras errores de permisos con MySQL:

```bash
# Usar SQLite para pruebas (más confiable)
docker compose exec web python -c "
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
import django
from django.conf import settings
settings.DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
django.setup()
exec(open('/usr/src/app/Inventario/tests/test_basic_logic.py').read())
"
```

O consulta la guía completa en: `app/SOLUCION_PRUEBAS.md`

---

## 🛠️ 7. Comandos útiles

- **Detener y eliminar contenedores**:
  ```bash
  docker compose down
  ```

- **Detener sin eliminar**:
  ```bash
  docker compose stop
  ```

- **Reiniciar contenedores**:
  ```bash
  docker compose restart
  ```

- **Ejecutar comandos en el contenedor web**:
  ```bash
  docker compose exec web bash
  ```

- **Ver logs del contenedor**:
  ```bash
  docker compose logs web
  docker compose logs db
  ```

- **Ejecutar migraciones manualmente**:
  ```bash
  docker compose exec web python manage.py makemigrations
  docker compose exec web python manage.py migrate
  ```

- **Abrir shell de Django**:
  ```bash
  docker compose exec web python manage.py shell
  ```

- **Ejecutar comandos de base de datos**:
  ```bash
  docker compose exec db mysql -u myuser -p mydb
  ```

---

## 🐞 Problemas comunes

1. **Puerto ocupado (`3306` o `8000`)**
   - Asegúrate de que no haya otro proceso usándolos (`XAMPP`, `MySQL`, etc.).

2. **Error de conexión a MySQL**
   - Revisa los valores del archivo `.env`.

3. **Permisos del script `docker-entrypoint.sh`**
   - Asegúrate de darle permisos:
     ```bash
     chmod +x docker-entrypoint.sh
     ```

4. **Problemas con las pruebas**
   - Si encuentras errores de permisos con MySQL en las pruebas:
     ```bash
     # Usar pruebas básicas (siempre funciona)
     docker compose exec web bash -c "cd Inventario/tests && python test_basic_logic.py"
     ```
   - Para más soluciones, consulta: `app/SOLUCION_PRUEBAS.md`

5. **Error "Module not found"**
   - Asegúrate de estar ejecutando los comandos dentro del contenedor:
     ```bash
     docker compose exec web python manage.py <comando>
     ```

---

## 📁 Estructura del Proyecto Completa

```
.
├── docker-compose.yml          # Configuración de contenedores
├── package.json               # Dependencias del frontend
├── README.md                  # Este archivo
├── app/                       # Aplicación Django
│   ├── Dockerfile             # Imagen Docker del backend
│   ├── manage.py              # Comando Django
│   ├── requirements.txt       # Dependencias Python
│   ├── core/                  # Configuración principal
│   │   ├── settings.py        # Configuración Django
│   │   ├── urls.py            # URLs principales
│   │   └── ...
│   ├── Inventario/            # App principal del inventario
│   │   ├── models.py          # Modelos de base de datos
│   │   ├── views.py           # Lógica de vistas
│   │   ├── api/               # API REST
│   │   │   ├── views.py       # ViewSets de la API
│   │   │   ├── serializers.py # Serializers DRF
│   │   │   └── urls.py        # URLs de la API
│   │   ├── tests/             # 🧪 Suite de pruebas
│   │   │   ├── test_models.py          # Pruebas de modelos
│   │   │   ├── test_api_endpoints.py   # Pruebas de API
│   │   │   ├── test_integration.py     # Pruebas de integración
│   │   │   ├── test_basic_logic.py     # Pruebas básicas
│   │   │   └── README.md               # Guía de pruebas
│   │   └── migrations/        # Migraciones de base de datos
│   ├── SOLUCION_PRUEBAS.md   # Guía para solucionar problemas de pruebas
│   └── simple_test_runner.py # Script alternativo para pruebas
├── frontend/                  # Aplicación React
│   ├── inventario-ecoladrillos/
│   │   ├── Dockerfile         # Imagen Docker del frontend
│   │   ├── package.json       # Dependencias Node.js
│   │   ├── src/               # Código fuente React
│   │   │   ├── components/    # Componentes React
│   │   │   ├── contexts/      # Context API
│   │   │   ├── common/        # Hooks y utilidades
│   │   │   └── assets/        # Recursos estáticos
│   │   └── public/            # Archivos públicos
└── mysql/                     # Datos de MySQL (generado automáticamente)
```

---

## 🚀 Tecnologías Utilizadas

- **Backend**: Django 4.x + Django REST Framework
- **Frontend**: React 18 + Vite
- **Base de Datos**: MySQL 8.0
- **Containerización**: Docker + Docker Compose
- **Estilos**: SASS/SCSS
- **Testing**: Django TestCase + Jest (frontend)

---

## 📚 Documentación Adicional

- `API_DOCUMENTATION.md` - Documentación completa de la API
- `API_EXAMPLES.md` - Ejemplos de uso de los endpoints
- `REPORTES_API.md` - Documentación específica de reportes
- `ADMIN_SETUP.md` - Configuración del panel de administración
- `app/Inventario/tests/README.md` - Guía completa de pruebas
