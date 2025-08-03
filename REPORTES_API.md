# API de Reportes - Generación por Demanda

## Endpoints para Generar Reportes (POST)

### 1. Generar Reporte de Stock en Fecha
**POST** `/api/reportes/generar_stock_fecha/`

Genera y guarda un reporte de stock en una fecha específica.

**Body (JSON):**
```json
{
    "fecha": "2025-07-15"
}
```

**Respuesta:**
```json
{
    "mensaje": "Reporte generado exitosamente",
    "reporte_id": 123,
    "tipo_reporte": "Stock en Fecha",
    "fecha_generacion": "2025-08-03T10:30:00Z",
    "fecha_consulta": "2025-07-15",
    "datos": {
        "fecha_consulta": "2025-07-15",
        "fecha_generacion": "2025-08-03T10:30:00Z",
        "ecoladrillos": [...],
        "materiales": [...]
    }
}
```

### 2. Generar Reporte de Inventario Actual
**POST** `/api/reportes/generar_resumen_inventario/`

Genera un reporte del estado actual del inventario (sin parámetros requeridos).

**Body:** `{}` (vacío)

**Respuesta:**
```json
{
    "mensaje": "Reporte generado exitosamente",
    "reporte_id": 124,
    "tipo_reporte": "Resumen de Inventario",
    "fecha_generacion": "2025-08-03T10:30:00Z",
    "datos": {
        "total_ecoladrillos": 5,
        "total_materiales": 3,
        "materiales_sin_stock": 1,
        "ecoladrillos_sin_stock": 0
    }
}
```

### 3. Generar Reporte de Retiros
**POST** `/api/reportes/generar_resumen_retiros/`

Genera un reporte de retiros en un período específico.

**Body (JSON):**
```json
{
    "fecha_inicio": "2025-07-01",
    "fecha_fin": "2025-07-31"
}
```

**Nota:** Si no se proporcionan fechas, usa los últimos 30 días automáticamente.

## Endpoints para Consultar Reportes (GET)

### 4. Historial de Reportes
**GET** `/api/reportes/historial/`

Lista todos los reportes generados y guardados.

**Parámetros de filtro:**
- `tipo`: Filtrar por tipo (stock_fecha, resumen_inventario, resumen_retiros)
- `fecha_desde`: Mostrar reportes desde una fecha específica

**Ejemplos:**
```
GET /api/reportes/historial/
GET /api/reportes/historial/?tipo=stock_fecha
GET /api/reportes/historial/?fecha_desde=2025-07-01
```

### 5. Ver Datos de Reporte Específico
**GET** `/api/reportes/{id}/ver_datos/`

Muestra solo los datos de un reporte específico.

**Ejemplo:**
```
GET /api/reportes/123/ver_datos/
```

### 6. CRUD Estándar de Reportes
Los endpoints estándar del ViewSet también están disponibles:

- **GET** `/api/reportes/` - Lista reportes con metadatos
- **GET** `/api/reportes/{id}/` - Detalle de un reporte
- **DELETE** `/api/reportes/{id}/` - Eliminar reporte

## Flujo de Trabajo

### 1. Generar Reportes
```bash
# Generar reporte de stock en fecha específica
curl -X POST /api/reportes/generar_stock_fecha/ \
  -H "Content-Type: application/json" \
  -d '{"fecha": "2025-07-15"}'

# Generar reporte de inventario actual
curl -X POST /api/reportes/generar_resumen_inventario/ \
  -H "Content-Type: application/json" \
  -d '{}'

# Generar reporte de retiros
curl -X POST /api/reportes/generar_resumen_retiros/ \
  -H "Content-Type: application/json" \
  -d '{"fecha_inicio": "2025-07-01", "fecha_fin": "2025-07-31"}'
```

### 2. Consultar Reportes
```bash
# Ver historial
curl /api/reportes/historial/

# Ver datos específicos de un reporte
curl /api/reportes/123/ver_datos/

# Filtrar por tipo
curl /api/reportes/historial/?tipo=stock_fecha
```

## Características

✅ **Generación por Demanda**: Los reportes se crean solo cuando se solicitan via POST  
✅ **Datos Automáticos**: Fecha de generación y operario se asignan automáticamente  
✅ **Persistencia**: Todos los reportes se guardan en BD  
✅ **Consulta Separada**: GET para consultar, POST para generar  
✅ **Validación**: Validación de fechas y parámetros requeridos  
✅ **Filtros**: Buscar reportes por tipo y fecha  

## Ventajas del Nuevo Enfoque

- **Control Total**: Generas reportes solo cuando los necesitas
- **Performance**: No se calculan datos en cada consulta
- **Trazabilidad**: Cada reporte tiene timestamp y operario
- **Historial**: Puedes ver reportes anteriores sin recalcular
- **Flexibilidad**: Separación clara entre generación y consulta
