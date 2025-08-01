# Guía de Autenticación y Registro - API Ecoladrillos

## Resumen de Cambios Realizados

### Problemas Solucionados:
1. ✅ **Eliminado el tipo de usuario por defecto**: Ahora es obligatorio seleccionar si eres operario o administrador al registrarse
2. ✅ **Creado endpoint público de registro**: Los usuarios pueden crear cuentas sin estar autenticados
3. ✅ **Mejorada la respuesta del login**: Ahora incluye claramente el tipo de usuario y permisos
4. ✅ **Agregado endpoint para tipos de usuario**: Para obtener las opciones disponibles en el frontend

## Endpoints Disponibles

### 1. Obtener Tipos de Usuario Disponibles
```http
GET /api/users/tipos-usuario/
```

**Respuesta:**
```json
{
  "tipos_usuario": [
    {"value": "operario", "label": "Operario"},
    {"value": "administrador", "label": "Administrador"}
  ]
}
```

### 2. Registro de Nuevo Usuario (Público)
```http
POST /api/users/registro/
Content-Type: application/json

{
  "username": "nuevo_usuario",
  "email": "usuario@email.com",
  "first_name": "Nombre",
  "last_name": "Apellido",
  "tipo_usuario": "operario",  // o "administrador"
  "password": "password123",
  "password_confirm": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "username": "nuevo_usuario",
    "email": "usuario@email.com",
    "first_name": "Nombre",
    "last_name": "Apellido",
    "tipo_usuario": "operario",
    "is_active": true
  },
  "tokens": {
    "refresh": "token_jwt_refresh",
    "access": "token_jwt_access"
  },
  "token": "token_sesion"
}
```

### 3. Login
```http
POST /api/users/login/
Content-Type: application/json

{
  "username": "usuario",
  "password": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "username": "usuario",
    "email": "usuario@email.com",
    "first_name": "Nombre",
    "last_name": "Apellido",
    "tipo_usuario": "operario",
    "es_administrador": false,
    "es_operario": true,
    "is_active": true
  },
  "tokens": {
    "refresh": "token_jwt_refresh",
    "access": "token_jwt_access"
  },
  "token": "token_sesion"
}
```

### 4. Logout
```http
POST /api/users/logout/
Authorization: Bearer <access_token>
```

## Flujo Recomendado para el Frontend

### Para el Registro:
1. **Cargar opciones de tipo de usuario:**
   ```javascript
   fetch('/api/users/tipos-usuario/')
     .then(response => response.json())
     .then(data => {
       // Usar data.tipos_usuario para llenar un select/radio buttons
     });
   ```

2. **Mostrar formulario de registro con:**
   - Username (requerido)
   - Email (requerido)
   - Nombre (requerido)
   - Apellido (requerido)
   - Tipo de usuario (select: operario/administrador)
   - Contraseña (mínimo 8 caracteres)
   - Confirmar contraseña

3. **Enviar datos de registro:**
   ```javascript
   fetch('/api/users/registro/', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       username: 'usuario',
       email: 'email@test.com',
       first_name: 'Nombre',
       last_name: 'Apellido',
       tipo_usuario: 'operario', // o 'administrador'
       password: 'password123',
       password_confirm: 'password123'
     })
   });
   ```

### Para el Login:
1. **Mostrar formulario con solo:**
   - Username/Email
   - Contraseña

2. **Después del login exitoso:**
   - Guardar tokens para futuras requests
   - Redirigir según el tipo de usuario:
     - `user.es_administrador === true` → Dashboard de administrador
     - `user.es_operario === true` → Dashboard de operario

## Validaciones Implementadas

### Registro:
- ✅ Username único
- ✅ Email único y válido
- ✅ Contraseña mínimo 8 caracteres
- ✅ Confirmación de contraseña
- ✅ Tipo de usuario obligatorio
- ✅ Nombres y apellidos requeridos

### Login:
- ✅ Usuario debe existir
- ✅ Contraseña correcta
- ✅ Usuario debe estar activo

## Comandos Docker para Aplicar Cambios

Si necesitas aplicar estos cambios en tu entorno:

```bash
# Generar migraciones
docker-compose exec web python manage.py makemigrations

# Aplicar migraciones
docker-compose exec web python manage.py migrate

# Reiniciar contenedores si es necesario
docker-compose restart
```

## Notas Importantes

1. **Usuarios existentes:** Los usuarios que ya existen mantendrán su tipo_usuario actual
2. **Perfiles automáticos:** Al crear un usuario, se crea automáticamente su perfil (PerfilOperario o PerfilAdministrador) mediante signals
3. **Autenticación:** Se mantiene compatibilidad con tokens JWT y tokens de sesión
4. **Permisos:** Los endpoints de gestión de usuarios siguen requiriendo autenticación

## Próximos Pasos Sugeridos

1. **Frontend:** Implementar los formularios de registro y login con las validaciones
2. **Seguridad:** Agregar rate limiting a los endpoints de autenticación
3. **Notificaciones:** Implementar confirmación por email para nuevos registros
4. **Roles:** Considerar agregar roles más granulares si es necesario
