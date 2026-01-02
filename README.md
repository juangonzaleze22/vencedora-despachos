# Vencedora Despachos - Electron App

Aplicación de escritorio para gestión de despachos construida con Electron, React y SQLite.

## 🚀 Tecnologías

- **Electron** - Framework para aplicaciones de escritorio
- **React** - Librería UI
- **React Router** - Navegación
- **Vite** - Build tool y dev server
- **Express** - Servidor HTTP local
- **SQLite** (better-sqlite3) - Base de datos local
- **Socket.IO** - Comunicación en tiempo real
- **Tailwind CSS** - Estilos
- **Flowbite React** - Componentes UI

## 📁 Estructura del Proyecto

```
/
├── electron/                 # Código de Electron
│   ├── main.js              # Proceso principal de Electron
│   ├── preload.js           # Script de preload
│   └── server/              # Servidor Express
│       ├── index.js         # Configuración del servidor
│       ├── db/              # Configuración de SQLite
│       └── src/
│           ├── routes/      # Rutas de API
│           └── socket/      # Configuración de Socket.IO
├── src/                     # Código React
│   ├── components/          # Componentes React
│   │   ├── auth/           # Componentes de autenticación
│   │   ├── layout/         # Componentes de layout
│   │   └── ui/             # Componentes UI reutilizables
│   ├── context/            # Contextos de React
│   ├── pages/              # Páginas de la aplicación
│   ├── services/           # Servicios de API
│   ├── css/                # Estilos
│   └── App.jsx             # Componente principal
├── public/                  # Archivos estáticos
└── index.html              # HTML principal

```

## 🔧 Instalación

```bash
# Instalar dependencias
npm install
```

## 💻 Desarrollo

```bash
# Iniciar en modo desarrollo (servidor + Vite + Electron)
npm run dev

# Solo servidor Express
npm run dev:server

# Solo Vite dev server
npm run dev:vite
```

El comando `npm run dev` inicia:
1. Servidor Express en `http://localhost:3000`
2. Vite dev server en `http://localhost:5173`
3. Aplicación Electron

## 🏗️ Build

```bash
# Build completo
npm run build

# Solo build de Vite
npm run build:vite

# Solo build de Electron
npm run build:electron
```

## 🎯 Características

### Autenticación
- Login con usuario y contraseña
- Roles: Despachador y Supervisor
- Sesión persistente (localStorage/sessionStorage)

### Gestión de Despachos
- Crear, editar y eliminar despachos
- Filtrar por estado (Pendiente, En Progreso, Completado, Cancelado)
- Vista de despachos por usuario (despachador)
- Vista de todos los despachos (supervisor)

### Dashboards
- Dashboard específico para despachadores
- Dashboard específico para supervisores
- Navegación rápida a secciones principales

## 🗄️ Base de Datos

La aplicación usa SQLite para almacenamiento local. La base de datos se crea automáticamente en:
```
electron/server/db/vencedora-despachos.db
```

### Tablas Principales
- `users` - Usuarios del sistema
- `despachos` - Despachos
- `clientes` - Clientes (futuro)

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Despachos
- `GET /api/despachos` - Obtener todos los despachos
- `GET /api/despachos/:id` - Obtener despacho por ID
- `GET /api/despachos/despachador/:id` - Obtener despachos de un despachador
- `POST /api/despachos` - Crear despacho
- `PUT /api/despachos/:id` - Actualizar despacho
- `DELETE /api/despachos/:id` - Eliminar despacho

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario

## 🎨 Diseño

- **Dark Theme** por defecto
- **Tipografía**:
  - Títulos: Montserrat (`font-title`)
  - Texto: Roboto (`font-body`)
- **Componentes**: Flowbite React para consistencia

## 📝 Notas de Desarrollo

### Mapeo de Campos Backend

El backend usa nombres de campos diferentes:

| Frontend | Backend |
|----------|---------|
| `cliente` | `nombre` |
| `status` | `estado` |
| `userId` | `despachadorId` |

Los servicios (`despachosService.js`) manejan automáticamente este mapeo.

### Rutas Protegidas

Las rutas están protegidas con el componente `ProtectedRoute`:
- Verifica autenticación
- Verifica roles cuando es necesario
- Redirige a login si no está autenticado

## 🐛 Troubleshooting

### El servidor no inicia
Verifica que el puerto 3000 esté disponible.

### Electron no abre
Asegúrate de que Vite esté corriendo en el puerto 5173.

### Errores de base de datos
Elimina `electron/server/db/vencedora-despachos.db` y reinicia la aplicación para recrear la base de datos.

## 📄 Licencia

Privado - Vencedora Despachos

## 👥 Equipo

Desarrollado para Vencedora Despachos
