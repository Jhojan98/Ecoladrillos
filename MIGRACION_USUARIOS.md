# Migración del Sistema de Usuarios

## Resumen de Cambios

He migrado el manejo de usuarios de la aplicación `Inventario` a la nueva aplicación `users`, utilizando el sistema de usuarios nativo de Django (`AbstractUser`). Además, he añadido relaciones de usuario a los modelos de registro y retiro.

## Cambios Realizados

### 1. Nueva App `users`

#### Modelos creados:
- **Usuario**: Extiende `AbstractUser` de Django con campo `tipo_usuario` (operario/administrador)
- **PerfilOperario**: Perfil específico para operarios con campos adicionales como `cargo`
- **PerfilAdministrador**: Perfil específico para administradores con `nivel_acceso`

#### Características:
- Los perfiles se crean automáticamente usando signals
- Sistema de autenticación completo con JWT y tokens de sesión
- API completa para gestión de usuarios

### 2. Actualizaciones en la App `Inventario`

#### Modelos eliminados:
- `Usuario` (clase abstracta)
- `Operario`
- `Administrador`

#### Modelos actualizados:
- **RegistroEcoladrillo**: Añadido campo `usuario` (ForeignKey)
- **RetiroEcoladrillo**: Añadido campo `usuario` (ForeignKey)
- **RegistroMaterial**: Añadido campo `usuario` (ForeignKey)

#### API actualizada:
- Eliminadas las vistas de `OperarioViewSet` y `AdministradorViewSet`
- Todas las vistas requieren autenticación (`IsAuthenticated`)
- Los registros y retiros asignan automáticamente el usuario autenticado
- Serializadores actualizados para mostrar información del usuario

### 3. Configuración

#### Settings.py:
- Añadida app `users` a `INSTALLED_APPS`
- Configurado `AUTH_USER_MODEL = 'users.Usuario'`

#### URLs:
- Añadida ruta `api/users/` para la API de usuarios
- Eliminadas rutas de operarios y administradores del inventario

## Nuevos Endpoints de la API de Usuarios

### Autenticación:
- `POST /api/users/login/` - Login con JWT
- `POST /api/users/logout/` - Logout
- `POST /api/users/cambiar-password/` - Cambiar contraseña

### Gestión de usuarios:
- `GET/POST /api/users/usuarios/` - Listar/crear usuarios
- `GET/PUT/DELETE /api/users/usuarios/{id}/` - Detalle del usuario
- `GET/PUT /api/users/perfil/` - Perfil del usuario autenticado

### Listas específicas:
- `GET /api/users/operarios/` - Solo operarios
- `GET /api/users/administradores/` - Solo administradores
- `GET /api/users/estadisticas/` - Estadísticas de usuarios

## Endpoints Actualizados del Inventario

Todos los endpoints ahora requieren autenticación y los registros incluyen información del usuario:

### Registros y Retiros:
- `POST /api/v1/registros-ecoladrillo/` - El usuario se asigna automáticamente
- `POST /api/v1/retiros-ecoladrillo/` - El usuario se asigna automáticamente  
- `POST /api/v1/registros-material/` - El usuario se asigna automáticamente

### Respuestas incluyen:
- `usuario_nombre` - Nombre completo del usuario
- `usuario_username` - Username del usuario

## Migraciones Necesarias

Para aplicar estos cambios necesitarás:

1. Crear migraciones para la app `users`:
   ```bash
   python manage.py makemigrations users
   ```

2. Crear migraciones para la app `Inventario`:
   ```bash
   python manage.py makemigrations Inventario
   ```

3. Aplicar las migraciones:
   ```bash
   python manage.py migrate
   ```

## Notas Importantes

1. **Datos Existentes**: Si tienes datos existentes de usuarios, necesitarás crear un script de migración de datos.

2. **Autenticación**: Todos los endpoints del inventario ahora requieren autenticación. 

3. **Signals**: Los perfiles de usuario se crean automáticamente al crear un usuario.

4. **Compatibilidad**: La API mantiene tanto tokens JWT como tokens de sesión para compatibilidad.

5. **Permisos**: Podrás expandir fácilmente el sistema de permisos usando los grupos de Django.

## Próximos Pasos

1. Aplicar las migraciones
2. Crear un superusuario administrativo
3. Migrar datos existentes (si los hay)
4. Probar los endpoints de autenticación
5. Actualizar el frontend para usar el nuevo sistema de autenticación
