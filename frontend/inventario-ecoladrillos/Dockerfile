# Etapa 1: Construcción
FROM node:20.11.1-alpine3.18 AS builder

WORKDIR /app

# Copia solo los archivos esenciales primero (mejora la cache de Docker)
COPY package*.json ./
COPY vite.config.* ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Construye la app (Vite genera /dist)
RUN npm run build

# Etapa 2: Servir los archivos estáticos
FROM nginx:alpine

# Copia el build al servidor web
COPY --from=builder /app/dist /usr/share/nginx/html

# Opcional: nginx.conf para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
