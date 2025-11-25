# Portal Educativo Liceo Tecpán

Portal web para la gestión educativa del Liceo Tecpán, desarrollado con Next.js (frontend) y Express + PostgreSQL (backend).

## 🚀 Tecnologías

### Frontend
- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios

### Backend
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Passport.js** - OAuth con Google
- **Bcrypt** - Encriptación de contraseñas
- **Multer** - Carga de archivos

## 📋 Requisitos Previos

- Node.js 18 o superior
- PostgreSQL 12 o superior
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/liceo-tecpan.git
cd liceo-tecpan
```

### 2. Instalar dependencias

```bash
npm run install:all
```

O instalar manualmente:

```bash
# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
npm install
```

### 3. Configurar variables de entorno

#### Backend

Copia el archivo `.env.example` a `.env` en la carpeta `backend/`:

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=liceo_tecpan
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_seguro

# Google OAuth (obtén en https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

#### Frontend

Copia el archivo `.env.example` a `.env.local` en la carpeta `frontend/`:

```bash
cd frontend
cp .env.example .env.local
```

Edita si es necesario (por defecto apunta a `http://localhost:5000`).

### 4. Configurar la base de datos

Crea la base de datos PostgreSQL:

```sql
CREATE DATABASE liceo_tecpan;
```

Ejecuta las migraciones (si existen scripts de migración):

```bash
cd backend
npm run migrate
```

## 🏃‍♂️ Ejecutar el proyecto

### Modo desarrollo (ambos servidores)

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto iniciará:
- Frontend en `http://localhost:3000`
- Backend en `http://localhost:5000`

### Ejecutar por separado

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
npm run dev
```

## 📁 Estructura del Proyecto

```
liceo-tecpan/
├── frontend/           # Aplicación Next.js
│   ├── app/           # Rutas y páginas
│   ├── components/    # Componentes React
│   ├── context/       # Context API
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilidades
│   ├── public/        # Archivos estáticos
│   └── styles/        # Estilos globales
│
├── backend/           # API Express
│   ├── src/          # Código fuente
│   │   ├── config/   # Configuración
│   │   ├── controllers/  # Controladores
│   │   ├── middleware/   # Middleware
│   │   ├── models/       # Modelos de datos
│   │   └── routes/       # Rutas API
│   ├── database/     # Scripts de BD
│   └── server.js     # Punto de entrada
│
└── package.json      # Scripts del proyecto
```

## 🔐 Seguridad

- **NO** subas archivos `.env` al repositorio
- Los archivos `.env.example` son plantillas sin credenciales reales
- Genera un JWT_SECRET seguro para producción
- Configura correctamente los CORS en producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y pertenece al Liceo Tecpán.

## 👥 Autores

- Equipo de desarrollo Liceo Tecpán

## 📧 Contacto

Para más información, contacta a: [correo@liceotecpan.edu.gt](mailto:correo@liceotecpan.edu.gt)
