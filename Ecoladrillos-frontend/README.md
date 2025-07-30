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
