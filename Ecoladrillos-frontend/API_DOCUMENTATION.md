# API REST - Sistema de Inventario


## Configuración completada

Tu API REST está configurada con los siguientes endpoints:

### Base URL
```
http://localhost:8000/api/v1/
```

### 🔐 Autenticación JWT (Nueva funcionalidad)
```
http://localhost:8000/api/auth/
```

#### Endpoints de autenticación:
- **POST** `/api/auth/token/` - Obtener token de acceso (login)
- **POST** `/api/auth/token/refresh/` - Renovar token
- **POST** `/api/auth/token/verify/` - Verificar token

#### Ejemplo de login:
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "tu_password"
  }'
```

#### Respuesta de login:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Usar token en requests:
```bash
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  http://localhost:8000/api/v1/materiales/
```

## Endpoints principales

### 1. Materiales
- **GET** `/api/v1/materiales/` - Listar todos los materiales
- **POST** `/api/v1/materiales/` - Crear nuevo material
- **GET** `/api/v1/materiales/{id}/` - Obtener material específico
- **PUT** `/api/v1/materiales/{id}/` - Actualizar material
- **DELETE** `/api/v1/materiales/{id}/` - Eliminar material

**Endpoints especiales:**
- **GET** `/api/v1/materiales/por_tipo/?tipo=plastico` - Filtrar por tipo
- **GET** `/api/v1/materiales/stock_disponible/` - Solo materiales con stock

### 2. Ecoladrillos
- **GET** `/api/v1/ecoladrillos/` - Listar todos los ecoladrillos
- **POST** `/api/v1/ecoladrillos/` - Crear nuevo ecoladrillo
- **GET** `/api/v1/ecoladrillos/{id}/` - Obtener ecoladrillo específico
- **PUT** `/api/v1/ecoladrillos/{id}/` - Actualizar ecoladrillo
- **DELETE** `/api/v1/ecoladrillos/{id}/` - Eliminar ecoladrillo

**Endpoints especiales:**
- **GET** `/api/v1/ecoladrillos/stock_bajo/` - Ecoladrillos con stock < 10

### 3. Registros de Ecoladrillos
- **GET** `/api/v1/registros-ecoladrillo/` - Listar registros
- **POST** `/api/v1/registros-ecoladrillo/` - Crear registro
- **GET** `/api/v1/registros-ecoladrillo/por_fecha/?fecha_inicio=2024-01-01&fecha_fin=2024-12-31`

### 4. Operarios
- **GET** `/api/v1/operarios/` - Listar operarios
- **POST** `/api/v1/operarios/` - Crear operario

### 5. Reportes
- **GET** `/api/v1/reportes/` - Listar reportes
- **GET** `/api/v1/reportes/resumen_inventario/` - Resumen general del inventario

## Ejemplos de uso

### 1. Crear un nuevo material
```bash
curl -X POST http://localhost:8000/api/v1/materiales/ \
  -H "Content-Type: application/json" \
  -d '{
    "id_insumo": 1,
    "nombre": "Plástico PET",
    "tipo": "plastico",
    "cantidad_disponible": 100,
    "unidad_medida": "kg"
  }'
```

### 2. Crear un ecoladrillo
```bash
curl -X POST http://localhost:8000/api/v1/ecoladrillos/ \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ecoladrillo Verde",
    "descripcion": "Ecoladrillo fabricado con materiales reciclados",
    "cantidad": 50
  }'
```

### 3. Obtener materiales con stock bajo
```bash
curl http://localhost:8000/api/v1/materiales/stock_disponible/
```

### 4. Crear un registro de ecoladrillo
```bash
curl -X POST http://localhost:8000/api/v1/registros-ecoladrillo/ \
  -H "Content-Type: application/json" \
  -d '{
    "id_registro": 1,
    "fecha": "2024-01-15",
    "cantidad": 25,
    "material_usado": 1
  }'
```

## Respuestas de ejemplo

### Listado de materiales
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id_insumo": 1,
      "nombre": "Plástico PET",
      "tipo": "plastico",
      "cantidad_disponible": 100,
      "unidad_medida": "kg"
    }
  ]
}
```

### Resumen de inventario
```json
{
  "total_ecoladrillos": 15,
  "total_materiales": 8,
  "materiales_sin_stock": 2,
  "fecha_consulta": "2024-01-15"
}
```

## Características implementadas

✅ **CRUD completo** para todos los modelos
✅ **Paginación** automática (20 elementos por página)
✅ **Filtros personalizados** (por fecha, tipo, stock)
✅ **Endpoints especiales** para consultas comunes
✅ **Interfaz web navegable** en el navegador
✅ **Serialización** con campos relacionados
✅ **Validación** automática de datos
✅ **Autenticación JWT** configurada
✅ **Versiones actualizadas** compatibles con Python 3.10

## Solución al problema de Docker

**Error resuelto:** `djangorestframework-simplejwt==4.4.0` no era compatible con Python 3.10.

**Solución aplicada:**
1. ✅ Actualizado `requirements.txt` con versiones compatibles
2. ✅ Configurado JWT con `djangorestframework-simplejwt==5.3.1`
3. ✅ Agregados endpoints de autenticación
4. ✅ Configuración completa en `settings.py`

## Próximos pasos recomendados

1. **Autenticación**: Implementar login/logout con tokens JWT
2. **Permisos**: Restringir operaciones según tipo de usuario
3. **Validaciones**: Agregar validaciones de negocio más específicas
4. **Testing**: Crear tests para los endpoints
5. **Documentación automática**: Integrar Swagger/OpenAPI

## Cómo probar la API

1. Ejecuta el servidor: `python manage.py runserver`
2. Visita `http://localhost:8000/api/v1/` en tu navegador
3. Usa la interfaz web navegable de Django REST Framework
4. O usa herramientas como Postman, curl o Thunder Client

## Estructura de archivos creados

```
Inventario/
├── api/
│   ├── serializers.py  # Conversión datos ↔ JSON
│   ├── views.py        # Lógica de endpoints
│   └── urls.py         # Configuración de rutas
```
