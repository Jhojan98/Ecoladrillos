# API REST - Sistema de Inventario de Ecoladrillos

## 🎯 Resumen de la actualización del proyecto

El sistema ha evolucionado significativamente con **nuevas funcionalidades de gestión inteligente de inventario** que incluyen:

✅ **Gestión avanzada de ecoladrillos con tamaños y materiales**  
✅ **Control automático de stock y materiales**  
✅ **Retiros de ecoladrillos con trazabilidad**  
✅ **Lógica de negocio integrada**  
✅ **Reportes y análisis de inventario**  

---

## 🚀 Configuración y URLs Base

### Base URL
```
http://localhost:8000/api/v1/
```

### 🔐 Autenticación JWT
```
http://localhost:8000/api/auth/
```

#### Endpoints de autenticación:
- **POST** `/api/auth/token/` - Obtener token de acceso (login)
- **POST** `/api/auth/token/refresh/` - Renovar token
- **POST** `/api/auth/token/verify/` - Verificar token

#### Ejemplo de autenticación:
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

## 📋 Endpoints principales

### 1. 🧱 Materiales
- **GET** `/api/v1/materiales/` - Listar todos los materiales
- **POST** `/api/v1/materiales/` - Crear nuevo material
- **GET** `/api/v1/materiales/{id}/` - Obtener material específico
- **PUT** `/api/v1/materiales/{id}/` - Actualizar material
- **DELETE** `/api/v1/materiales/{id}/` - Eliminar material

**Endpoints especiales:**
- **GET** `/api/v1/materiales/por_tipo/?tipo=plastico` - Filtrar por tipo
- **GET** `/api/v1/materiales/stock_disponible/` - Solo materiales con stock

### 2. 🟢 Ecoladrillos *(Funcionalidad mejorada)*
- **GET** `/api/v1/ecoladrillos/` - Listar todos los ecoladrillos
- **POST** `/api/v1/ecoladrillos/` - Crear nuevo ecoladrillo
- **GET** `/api/v1/ecoladrillos/{id}/` - Obtener ecoladrillo específico
- **PUT** `/api/v1/ecoladrillos/{id}/` - Actualizar ecoladrillo
- **DELETE** `/api/v1/ecoladrillos/{id}/` - Eliminar ecoladrillo

**Nuevos campos disponibles:**
- `size`: Tamaño (small, medium, large)
- `material_principal`: Material principal requerido
- `cantidad_material_requerida`: Cantidad de material por unidad
- `cantidad`: Stock disponible

**Endpoints especiales:**
- **GET** `/api/v1/ecoladrillos/stock_bajo/` - Ecoladrillos con stock < 10
- **GET** `/api/v1/ecoladrillos/{id}/stock_disponible/` - Stock de un ecoladrillo específico
- **GET** `/api/v1/ecoladrillos/reporte_stock/` - Reporte completo de stock

### 3. 📝 Registros de Ecoladrillos *(Lógica de negocio integrada)*
- **GET** `/api/v1/registros-ecoladrillo/` - Listar registros de producción
- **POST** `/api/v1/registros-ecoladrillo/` - Registrar nueva producción *(automáticamente consume materiales)*
- **GET** `/api/v1/registros-ecoladrillo/{id}/` - Obtener registro específico
- **PUT** `/api/v1/registros-ecoladrillo/{id}/` - Actualizar registro
- **DELETE** `/api/v1/registros-ecoladrillo/{id}/` - Eliminar registro

**Endpoints especiales:**
- **GET** `/api/v1/registros-ecoladrillo/por_fecha/?fecha_inicio=2024-01-01&fecha_fin=2024-12-31`

### 4. 🔄 Retiros de Ecoladrillos *(Nueva funcionalidad)*
- **GET** `/api/v1/retiros-ecoladrillo/` - Listar retiros
- **POST** `/api/v1/retiros-ecoladrillo/` - Registrar nuevo retiro *(automáticamente reduce stock)*
- **GET** `/api/v1/retiros-ecoladrillo/{id}/` - Obtener retiro específico
- **PUT** `/api/v1/retiros-ecoladrillo/{id}/` - Actualizar retiro
- **DELETE** `/api/v1/retiros-ecoladrillo/{id}/` - Eliminar retiro

**Campos requeridos:**
- `ecoladrillo`: ID del ecoladrillo
- `cantidad`: Cantidad a retirar
- `motivo`: Razón del retiro
- `fecha`: Fecha del retiro

**Endpoints especiales:**
- **GET** `/api/v1/retiros-ecoladrillo/por_fecha/?fecha_inicio=2024-01-01&fecha_fin=2024-12-31`
- **GET** `/api/v1/retiros-ecoladrillo/por_ecoladrillo/?ecoladrillo_id=1`

### 5. 📦 Registros de Material *(Gestión automática de stock)*
- **GET** `/api/v1/registros-material/` - Listar ingresos de material
- **POST** `/api/v1/registros-material/` - Registrar ingreso *(automáticamente suma al stock)*
- **GET** `/api/v1/registros-material/{id}/` - Obtener registro específico
- **PUT** `/api/v1/registros-material/{id}/` - Actualizar registro
- **DELETE** `/api/v1/registros-material/{id}/` - Eliminar registro

### 6. 👥 Operarios
- **GET** `/api/v1/operarios/` - Listar operarios
- **POST** `/api/v1/operarios/` - Crear operario
- **GET** `/api/v1/operarios/{id}/` - Obtener operario específico
- **PUT** `/api/v1/operarios/{id}/` - Actualizar operario
- **DELETE** `/api/v1/operarios/{id}/` - Eliminar operario

### 7. 👨‍💼 Administradores
- **GET** `/api/v1/administradores/` - Listar administradores
- **POST** `/api/v1/administradores/` - Crear administrador
- **GET** `/api/v1/administradores/{id}/` - Obtener administrador específico
- **PUT** `/api/v1/administradores/{id}/` - Actualizar administrador
- **DELETE** `/api/v1/administradores/{id}/` - Eliminar administrador

### 8. 📊 Reportes *(Funcionalidad extendida)*
- **GET** `/api/v1/reportes/` - Listar reportes
- **POST** `/api/v1/reportes/` - Crear reporte
- **GET** `/api/v1/reportes/resumen_inventario/` - Resumen general del inventario
- **GET** `/api/v1/reportes/resumen_retiros/?fecha_inicio=2024-01-01&fecha_fin=2024-12-31` - Análisis de retiros

## 💡 Ejemplos de uso actualizados

### 1. Crear un nuevo material
```bash
curl -X POST http://localhost:8000/api/v1/materiales/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_jwt" \
  -d '{
    "nombre": "Plástico PET Reciclado",
    "tipo": "plastico",
    "cantidad_disponible": 500,
    "unidad_medida": "kg"
  }'
```

### 2. Crear un ecoladrillo *(Con nuevos campos)*
```bash
curl -X POST http://localhost:8000/api/v1/ecoladrillos/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_jwt" \
  -d '{
    "nombre": "Ecoladrillo Verde Mediano",
    "descripcion": "Ecoladrillo fabricado con materiales reciclados, tamaño mediano",
    "size": "medium",
    "material_principal": 1,
    "cantidad_material_requerida": 2,
    "cantidad": 0
  }'
```

### 3. Registrar producción de ecoladrillos *(Consume materiales automáticamente)*
```bash
curl -X POST http://localhost:8000/api/v1/registros-ecoladrillo/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_jwt" \
  -d '{
    "fecha": "2025-07-31",
    "ecoladrillo": 1,
    "cantidad": 10
  }'
```
> **Nota:** Este endpoint verifica automáticamente si hay suficiente material y consume la cantidad necesaria.

### 4. Registrar retiro de ecoladrillos *(Nueva funcionalidad)*
```bash
curl -X POST http://localhost:8000/api/v1/retiros-ecoladrillo/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_jwt" \
  -d '{
    "fecha": "2025-07-31",
    "ecoladrillo": 1,
    "cantidad": 5,
    "motivo": "Venta a cliente corporativo"
  }'
```

### 5. Registrar ingreso de material *(Suma stock automáticamente)*
```bash
curl -X POST http://localhost:8000/api/v1/registros-material/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_jwt" \
  -d '{
    "id_ingreso": 101,
    "fecha": "2025-07-31",
    "cantidad": 100,
    "material": 1,
    "origen": "Proveedor ABC - Donación comunitaria"
  }'
```

### 6. Obtener reporte de stock de ecoladrillos
```bash
curl -H "Authorization: Bearer tu_token_jwt" \
  http://localhost:8000/api/v1/ecoladrillos/reporte_stock/
```

### 7. Obtener análisis de retiros por período
```bash
curl -H "Authorization: Bearer tu_token_jwt" \
  "http://localhost:8000/api/v1/reportes/resumen_retiros/?fecha_inicio=2025-01-01&fecha_fin=2025-12-31"
```

## 📊 Respuestas de ejemplo actualizadas

### Listado de ecoladrillos *(con nuevos campos)*
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id_ecoladrillo": 1,
      "nombre": "Ecoladrillo Verde Mediano",
      "descripcion": "Ecoladrillo fabricado con materiales reciclados",
      "size": "medium",
      "size_display": "Medium",
      "material_principal": 1,
      "material_principal_nombre": "Plástico PET Reciclado",
      "cantidad_material_requerida": 2,
      "cantidad": 45
    }
  ]
}
```

### Reporte de stock de ecoladrillos *(nuevo endpoint)*
```json
{
  "total_tipos_ecoladrillos": 5,
  "stock_total": 234,
  "tipos_con_stock_bajo": 2,
  "tipos_sin_stock": 1,
  "ecoladrillos": [
    {
      "id_ecoladrillo": 1,
      "nombre": "Ecoladrillo Verde Mediano",
      "cantidad": 45,
      "material_principal_nombre": "Plástico PET Reciclado"
    }
  ]
}
```

### Análisis de retiros *(nueva funcionalidad)*
```json
{
  "total_retiros": 12,
  "cantidad_total_retirada": 156,
  "retiros_por_tipo": {
    "Ecoladrillo Verde Mediano": 89,
    "Ecoladrillo Azul Grande": 67
  },
  "periodo": {
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-07-31"
  }
}
```

### Registro de ecoladrillo *(con validación)*
```json
{
  "id_registro": 15,
  "fecha": "2025-07-31",
  "ecoladrillo": 1,
  "ecoladrillo_nombre": "Ecoladrillo Verde Mediano",
  "cantidad": 10
}
```

### Error de validación *(stock insuficiente)*
```json
{
  "error": "No hay suficiente Plástico PET Reciclado disponible. Necesario: 20 kg, Disponible: 15 kg",
  "codigo_estado": 400
}
```

### Resumen de inventario actualizado
```json
{
  "total_ecoladrillos": 5,
  "total_materiales": 8,
  "materiales_sin_stock": 2,
  "fecha_consulta": "2025-07-31"
}
```

## ✨ Nuevas características implementadas

### 🎯 **Gestión Inteligente de Inventario**
✅ **Control automático de stock** - Los registros y retiros actualizan automáticamente las cantidades  
✅ **Validación de materiales** - Verifica disponibilidad antes de permitir producciones  
✅ **Trazabilidad completa** - Seguimiento de todos los movimientos de materiales y ecoladrillos  

### 🏗️ **Modelo de Ecoladrillos Mejorado**
✅ **Tamaños definidos** - Small, Medium, Large con diferentes requerimientos  
✅ **Material principal asignado** - Cada ecoladrillo tiene un material específico  
✅ **Cálculo automático** - Determina la cantidad de material necesaria por unidad  

### 📦 **Sistema de Retiros**
✅ **Retiros trazables** - Registro de salidas con motivo y fecha  
✅ **Reducción automática** - El stock se actualiza automáticamente  
✅ **Reportes de retiros** - Análisis por período y tipo de ecoladrillo  

### 🔧 **Lógica de Negocio Integrada**
✅ **Validaciones automáticas** - Previene operaciones inválidas  
✅ **Manejo de errores mejorado** - Respuestas consistentes y claras  
✅ **Transacciones seguras** - Operaciones atómicas para mantener integridad  

### 📊 **Reportes Avanzados**
✅ **Análisis de stock** - Reportes detallados de inventario  
✅ **Seguimiento de retiros** - Estadísticas de salidas por período  
✅ **Alertas de stock bajo** - Identificación automática de niveles críticos  

### 🔐 **Seguridad y Autenticación**
✅ **JWT configurado** - Autenticación moderna y segura  
✅ **Tokens de renovación** - Sistema de refresh tokens  
✅ **Manejo de permisos** - Base para control de acceso  

### 🐳 **Infraestructura Docker**
✅ **Contenedores optimizados** - Django + MySQL en Docker  
✅ **Migraciones automáticas** - Configuración de base de datos automatizada  
✅ **Variables de entorno** - Configuración flexible y segura  

## 🚨 Validaciones importantes del sistema

### Al registrar producción de ecoladrillos:
1. **Verifica stock de material** - Calcula si hay suficiente material disponible
2. **Consume material automáticamente** - Reduce la cantidad del material principal
3. **Aumenta stock de ecoladrillos** - Suma la cantidad producida al inventario

### Al registrar retiros:
1. **Verifica stock disponible** - Confirma que hay suficientes ecoladrillos
2. **Reduce stock automáticamente** - Actualiza la cantidad disponible
3. **Registra trazabilidad** - Guarda motivo y fecha del retiro

### Al registrar ingreso de materiales:
1. **Aumenta stock automáticamente** - Suma la cantidad al material correspondiente
2. **Registra origen** - Mantiene trazabilidad de la fuente del material

## 🛠️ Configuración técnica actual

### Tecnologías implementadas:
- **Django 5.2.4** - Framework web principal
- **Django REST Framework 3.15.2** - API REST
- **MySQL 8.0** - Base de datos
- **JWT Authentication** - djangorestframework-simplejwt 5.3.1
- **Docker & Docker Compose** - Contenedorización

### Estructura del proyecto actualizada:
```
Inventario/
├── api/
│   ├── serializers.py    # ✅ Serializers con campos relacionados
│   ├── views.py          # ✅ ViewSets con lógica de negocio
│   ├── urls.py           # ✅ 8 endpoints principales configurados
│   ├── auth_urls.py      # ✅ Autenticación JWT
│   └── exceptions.py     # ✅ Manejo personalizado de errores
├── models.py             # ✅ Modelos con lógica de inventario
├── admin.py              # ✅ Panel de administración configurado
└── migrations/           # ✅ 6 migraciones aplicadas
```

### Últimas migraciones aplicadas:
- **0006** - Reestructuración del modelo Ecoladrillo con tamaños y material principal
- **0005** - Adición de campo ecoladrillo en RetiroEcoladrillo
- **0004-0003** - Optimizaciones en el modelo de registro

## 🔧 Próximos pasos recomendados

### 1. **🔐 Seguridad avanzada**
- Implementar permisos por rol (Operario vs Administrador)
- Configurar CORS para frontend
- Añadir rate limiting

### 2. **📊 Analytics y reportes**
- Dashboard de métricas en tiempo real
- Gráficos de producción vs consumo
- Proyecciones de inventario

### 3. **🚀 Optimizaciones**
- Cache de consultas frecuentes
- Compresión de respuestas JSON
- Logs de auditoría

### 4. **🧪 Testing**
- Tests unitarios para modelos
- Tests de integración para APIs
- Tests de carga para endpoints

### 5. **📖 Documentación automática**
- Integración con Swagger/OpenAPI
- Documentación interactiva
- Ejemplos de código automáticos

## 🚀 Cómo ejecutar el proyecto

### Usando Docker (Recomendado):
```bash
# 1. Clonar el repositorio
git clone https://github.com/Jhojan98/Ecoladrillos.git
cd Ecoladrillos

# 2. Configurar variables de entorno
cp .env.example .env.dev
# Editar .env.dev con tus configuraciones

# 3. Levantar los servicios
docker compose --env-file .env.dev up --build

# 4. La API estará disponible en:
# http://localhost:8000/api/v1/
```

### Acceso al panel de administración:
```bash
# Crear superusuario
docker compose exec web python manage.py createsuperuser

# Acceder en: http://localhost:8000/admin/
```

### Testing de la API:
1. **Interfaz navegable**: `http://localhost:8000/api/v1/`
2. **Postman/Insomnia**: Importar colección con los endpoints
3. **cURL**: Usar los ejemplos de esta documentación

## 🏗️ Estructura de modelos actualizada

### Ecoladrillo *(Modelo principal mejorado)*
```python
{
  "id_ecoladrillo": "AutoField (PK)",
  "nombre": "CharField(100)",
  "descripcion": "TextField",
  "size": "CharField (small/medium/large)",
  "material_principal": "ForeignKey(Material)",
  "cantidad_material_requerida": "IntegerField",
  "cantidad": "IntegerField (stock actual)"
}
```

### Material
```python
{
  "id_insumo": "AutoField (PK)",
  "nombre": "CharField(100)",
  "tipo": "CharField(50)",
  "cantidad_disponible": "IntegerField",
  "unidad_medida": "CharField(20)"
}
```

### RegistroEcoladrillo *(Con lógica automática)*
```python
{
  "id_registro": "AutoField (PK)",
  "fecha": "DateField",
  "ecoladrillo": "ForeignKey(Ecoladrillo)",
  "cantidad": "IntegerField"
}
```

### RetiroEcoladrillo *(Nuevo modelo)*
```python
{
  "id_retiro": "AutoField (PK)",
  "fecha": "DateField",
  "ecoladrillo": "ForeignKey(Ecoladrillo)",
  "cantidad": "IntegerField",
  "motivo": "CharField(200)"
}
```
