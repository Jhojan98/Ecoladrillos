"""
Configuración específica para pruebas
Sobrescribe algunas configuraciones para el entorno de testing
"""
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Base de datos SQLite para pruebas (más simple que MySQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',  # Base de datos en memoria para pruebas rápidas
    }
}

# Configuración mínima para pruebas
DEBUG = True
SECRET_KEY = 'test-secret-key-only-for-testing-123456'

# Apps mínimas necesarias para las pruebas
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'Inventario',
]

# Middleware mínimo
MIDDLEWARE = [
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
]

# Configuración REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# Zona horaria
USE_TZ = True
TIME_ZONE = 'UTC'

# Internacionalización
LANGUAGE_CODE = 'es-es'
USE_I18N = True
USE_L10N = True

# URLs de prueba
ROOT_URLCONF = 'core.urls'

# Configuración de logging para pruebas (silenciar logs)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['null'],
    },
}
