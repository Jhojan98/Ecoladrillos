# API Examples - Sistema de Inventario de Ecoladrillos

Esta documentación contiene ejemplos prácticos de cómo usar todos los endpoints de la API.

## Base URL
```
http://localhost:8000/api/v1/
```

## 📊 REPORTES

### 1. Generar Reporte de Stock en Fecha
**POST** `/reportes/generar_stock_fecha/`

```json
{
    "fecha": "2025-08-03",
    "operario_id": 1
}
```

**Respuesta:**
```json
{
    "mensaje": "Reporte de stock en fecha generado exitosamente",
    "reporte_id": 11,
    "tipo_reporte": "Stock en Fecha",
    "fecha_generacion": "2025-08-04T00:20:23.726249Z",
    "fecha_consulta": "2025-08-03",
    "operario": {
        "id": 1,
        "nombre": "Pablo"
    },
    "datos": {
        "fecha_consulta": "2025-08-03",
        "ecoladrillos": [...],
        "materiales": [...],
        "total_ecoladrillos": 1,
        "total_materiales": 2
    }
}
```

### 2. Generar Reporte de Resumen de Inventario
**POST** `/reportes/generar_resumen_inventario/`

```json
{
    "operario_id": 1
}
```

**Campos en la respuesta:**
- `ecoladrillos_sin_stock`: Lista de ecoladrillos sin stock
- `materiales_sin_stock`: Lista de materiales sin stock
- `ecoladrillos_con_stock`: Lista de ecoladrillos con stock
- `materiales_con_stock`: Lista de materiales con stock
- `resumen_estadisticas`: Estadísticas generales

### 3. Generar Reporte de Resumen de Retiros
**POST** `/reportes/generar_resumen_retiros/`

```json
{
    "fecha_inicio": "2025-07-01",
    "fecha_fin": "2025-08-03",
    "operario_id": 1
}
```

**Campos en la respuesta:**
- `retiros_detalle`: Lista detallada de retiros
- `resumen_por_ecoladrillo`: Resumen por tipo
- `estadisticas`: Estadísticas del período
- `periodo_info`: Información del período

### 4. Listar Todos los Reportes
**GET** `/reportes/`

Muestra todos los reportes con sus campos específicos según el tipo.

### 5. Obtener Reporte Específico
**GET** `/reportes/{id}/`

**GET** `/reportes/{id}/ver_datos/`

### 6. Historial con Filtros
**GET** `/reportes/historial/?tipo=resumen_inventario&fecha_desde=2025-08-01`

### 7. Operarios Disponibles
**GET** `/reportes/operarios_disponibles/`

**Respuesta:**
```json
[
    {
        "id": 1,
        "nombre": "Pablo",
        "cargo": "contratista",
        "display": "Pablo - contratista"
    }
]
```

## 👷 OPERARIOS

### Crear Operario
**POST** `/operarios/`

```json
{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "contraseña": "password123",
    "cargo": "Supervisor"
}
```

### Listar Operarios
**GET** `/operarios/`

## 🧱 ECOLADRILLOS

### Crear Ecoladrillo
**POST** `/ecoladrillos/`

```json
{
    "nombre": "Ecoladrillo Grande",
    "descripcion": "Ecoladrillo de tamaño grande para construcción",
    "size": "large",
    "material_principal": 1,
    "cantidad_material_requerida": 10,
    "cantidad": 0
}
```

### Listar Ecoladrillos
**GET** `/ecoladrillos/`

### Ecoladrillos con Stock Bajo
**GET** `/ecoladrillos/stock_bajo/`

### Stock Disponible de un Ecoladrillo
**GET** `/ecoladrillos/{id}/stock_disponible/`

### Reporte de Stock de Ecoladrillos
**GET** `/ecoladrillos/reporte_stock/`

## 🏗️ MATERIALES

### Crear Material
**POST** `/materiales/`

```json
{
    "nombre": "Plástico PET",
    "tipo": "Reciclado",
    "cantidad_disponible": 500,
    "unidad_medida": "Kg"
}
```

### Materiales por Tipo
**GET** `/materiales/por_tipo/?tipo=Reciclado`

### Materiales con Stock Disponible
**GET** `/materiales/stock_disponible/`

### Reporte de Stock de Materiales
**GET** `/materiales/reporte_stock/`

## 📝 REGISTRO DE ECOLADRILLOS

### Crear Registro de Producción
**POST** `/registros-ecoladrillo/`

```json
{
    "fecha": "2025-08-03",
    "ecoladrillo": 1,
    "cantidad": 50
}
```

**Nota:** Este endpoint automáticamente:
- Aumenta el stock del ecoladrillo
- Reduce el stock del material principal

### Registros por Fecha
**GET** `/registros-ecoladrillo/por_fecha/?fecha_inicio=2025-08-01&fecha_fin=2025-08-03`

## 📤 RETIROS DE ECOLADRILLOS

### Crear Retiro
**POST** `/retiros-ecoladrillo/`

```json
{
    "fecha": "2025-08-03",
    "ecoladrillo": 1,
    "cantidad": 20,
    "motivo": "Venta a cliente"
}
```

**Nota:** Este endpoint automáticamente reduce el stock del ecoladrillo.

### Retiros por Fecha
**GET** `/retiros-ecoladrillo/por_fecha/?fecha_inicio=2025-08-01&fecha_fin=2025-08-03`

### Retiros por Ecoladrillo
**GET** `/retiros-ecoladrillo/por_ecoladrillo/?ecoladrillo_id=1`

## 📦 REGISTRO DE MATERIALES

### Crear Registro de Material
**POST** `/registros-material/`

```json
{
    "fecha": "2025-08-03",
    "cantidad": 100,
    "material": 1,
    "origen": "Compra directa"
}
```

**Nota:** Este endpoint automáticamente aumenta el stock del material.

## 🔍 ENDPOINTS ESPECÍFICOS DE REPORTES

### Reportes de Stock en Fecha
**GET** `/reportes-stock-fecha/`
**GET** `/reportes-stock-fecha/{id}/`

### Reportes de Resumen de Inventario
**GET** `/reportes-resumen-inventario/`
**GET** `/reportes-resumen-inventario/{id}/`

### Reportes de Resumen de Retiros
**GET** `/reportes-resumen-retiros/`
**GET** `/reportes-resumen-retiros/{id}/`

## 🚀 EJEMPLOS CON cURL

### Generar Reporte de Inventario
```bash
curl -X POST "http://localhost:8000/api/v1/reportes/generar_resumen_inventario/" \
     -H "Content-Type: application/json" \
     -d '{"operario_id": 1}'
```

### Crear un Ecoladrillo
```bash
curl -X POST "http://localhost:8000/api/v1/ecoladrillos/" \
     -H "Content-Type: application/json" \
     -d '{
         "nombre": "Ecoladrillo Mediano",
         "descripcion": "Ecoladrillo estándar",
         "size": "medium",
         "material_principal": 1,
         "cantidad_material_requerida": 5
     }'
```

### Registrar Producción
```bash
curl -X POST "http://localhost:8000/api/v1/registros-ecoladrillo/" \
     -H "Content-Type: application/json" \
     -d '{
         "fecha": "2025-08-03",
         "ecoladrillo": 1,
         "cantidad": 25
     }'
```

## 📋 CÓDIGOS DE RESPUESTA HTTP

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Error en los datos enviados
- **404 Not Found**: Recurso no encontrado
- **405 Method Not Allowed**: Método HTTP no permitido
- **500 Internal Server Error**: Error interno del servidor

## ⚠️ NOTAS IMPORTANTES

1. **Operario ID**: Es opcional en la mayoría de endpoints de reportes
2. **Fechas**: Siempre usar formato `YYYY-MM-DD`
3. **Stock Automático**: Los registros y retiros actualizan automáticamente el stock
4. **Validaciones**: El sistema valida que haya suficiente material/stock antes de permitir operaciones
5. **Browsable API**: Para pruebas, usar herramientas como Postman, cURL o el "Raw data" en el navegador
