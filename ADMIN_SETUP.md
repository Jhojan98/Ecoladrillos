# Configuración del Admin de Django - Inventario de Ecoladrillos

### 📋 **Modelos Disponibles en Admin:**

#### 1. **Operarios**
- Lista: ID, Nombre, Email, Cargo
- Búsqueda: Por nombre, email, cargo
- Filtros: Por cargo
- Ordenamiento: Por nombre

#### 2. **Administradores**
- Lista: ID, Nombre, Email
- Búsqueda: Por nombre, email
- Ordenamiento: Por nombre

#### 3. **Ecoladrillos**
- Lista: ID, Nombre, Size, Material Principal, Material Requerido, Stock
- Búsqueda: Por nombre
- Filtros: Por size y material principal
- **Nota**: Campo `cantidad` es readonly (se maneja automáticamente)

#### 4. **Materiales**
- Lista: ID, Nombre, Tipo, Stock Disponible, Unidad
- Búsqueda: Por nombre y tipo
- Filtros: Por tipo y unidad de medida

#### 5. **Registros de Producción**
- Lista: ID, Fecha, Ecoladrillo, Cantidad
- Búsqueda: Por nombre del ecoladrillo
- Filtros: Por fecha y ecoladrillo
- Jerarquía de fechas para navegación temporal

#### 6. **Retiros de Ecoladrillos**
- Lista: ID, Fecha, Ecoladrillo, Cantidad, Motivo
- Búsqueda: Por ecoladrillo y motivo
- Filtros: Por fecha y ecoladrillo
- Jerarquía de fechas

#### 7. **Registros de Materiales** ✅ **NUEVO**
- Lista: ID, Fecha, Material, Cantidad, Origen
- Búsqueda: Por material y origen
- Filtros: Por fecha y material
- Jerarquía de fechas

#### 8. **Reportes** ✅ **NUEVO**
- Lista: ID, Tipo, Fecha Generación, Operario, Fecha Consulta, Período
- Búsqueda: Por tipo y operario
- Filtros: Por tipo, fecha de generación, operario
- **Campos organizados** en secciones lógicas
- **Datos del reporte** colapsables por defecto

### 🎛️ **Características Especiales del Admin de Reportes:**

```python
# Formulario organizado en secciones
fieldsets = (
    ('Información General', {
        'fields': ('tipo_reporte', 'operario', 'fecha_generacion')
    }),
    ('Fechas', {
        'fields': ('fecha_consulta', 'fecha_inicio', 'fecha_fin'),
        'description': 'Para reportes de stock usar fecha_consulta...'
    }),
    ('Datos del Reporte', {
        'fields': ('datos_reporte',),
        'classes': ('collapse',)  # Colapsado por defecto
    }),
)
```

### 🔧 **Funciones Personalizadas:**

- **`get_periodo()`**: Muestra automáticamente el período o fecha del reporte
- **Campos readonly**: Fecha de generación y cantidad de ecoladrillos
- **Jerarquía de fechas**: Navegación fácil por períodos temporales
- **Filtros avanzados**: Por fechas, tipos, operarios

### 🚀 **Cómo Acceder:**

1. **Crear superusuario** (si no tienes):
```bash
cd /home/jhojan/Desktop/ProyectoFIS/FIS/app
python manage.py createsuperuser
```

2. **Acceder al admin**:
```
http://localhost:8000/admin/
```

3. **Navegar por las secciones**:
- Inventario → Operarios, Ecoladrillos, Materiales
- Registros → Producciones, Retiros, Ingresos de Material
- Reportes → Ver y gestionar reportes generados

### 📊 **Gestión de Reportes desde Admin:**

- **Ver todos los reportes** generados
- **Filtrar por tipo** (stock_fecha, resumen_inventario, resumen_retiros)
- **Buscar por operario** que generó el reporte
- **Ver datos completos** del reporte en JSON
- **Eliminar reportes** antiguos si es necesario

### ⚠️ **Notas Importantes:**

1. **Stock Automático**: Los campos de cantidad se manejan automáticamente por la lógica de negocio
2. **Validaciones**: Todos los modelos mantienen sus validaciones al crear/editar desde admin
3. **Relaciones**: Los campos relacionados muestran información descriptiva
4. **Búsquedas**: Optimizadas para encontrar información rápidamente

¡Ahora tienes un panel de administración completo y profesional para gestionar todo el inventario de ecoladrillos!
