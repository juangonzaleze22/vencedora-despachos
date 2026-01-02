# 🚀 Guía de Inicio Rápido - Vencedora Despachos

## Requisitos Previos

- Node.js (v16 o superior)
- npm (viene con Node.js)

## Instalación

```bash
# 1. Instalar dependencias
npm install
```

## Ejecutar en Desarrollo

```bash
# Opción 1: Comando único (RECOMENDADO)
npm run dev
```

Este comando inicia automáticamente:
1. ✅ Servidor Express (puerto 3000)
2. ✅ Vite dev server (puerto 5173)
3. ✅ Aplicación Electron

### Comandos Individuales (si necesitas ejecutarlos por separado)

```bash
# Terminal 1: Servidor Express
npm run dev:server

# Terminal 2: Vite dev server
npm run dev:vite

# Terminal 3: Electron
npm start
```

## Credenciales de Prueba

Por defecto, el sistema acepta:
- **Usuario**: cualquier usuario existente en la base de datos
- **Contraseña**: `admin123` (contraseña por defecto)

## Estructura de Puertos

- **Backend API**: http://localhost:3000
- **Frontend (Vite)**: http://localhost:5173
- **Electron**: Ventana de escritorio

## Solución de Problemas

### Error: Puerto 3000 ocupado
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Cambiar puerto en electron/server/index.js
```

### Error: Puerto 5173 ocupado
```bash
# Cambiar puerto en vite.config.js
```

### La aplicación Electron no abre
1. Asegúrate de que Vite esté corriendo en el puerto 5173
2. Espera a que aparezca el mensaje "ready in X ms"
3. Luego Electron se abrirá automáticamente

### Error de base de datos
```bash
# Eliminar y recrear la base de datos
Remove-Item "electron\server\db\vencedora-despachos.db" -Force
npm run dev
```

## Build de Producción

```bash
# Build completo
npm run build

# Solo frontend
npm run build:vite

# Solo Electron
npm run build:electron
```

## Próximos Pasos

1. ✅ Ejecutar `npm install`
2. ✅ Ejecutar `npm run dev`
3. ✅ Esperar a que se abra la ventana de Electron
4. ✅ Iniciar sesión con las credenciales de prueba
5. ✅ Explorar la aplicación

## Notas Importantes

- La base de datos SQLite se crea automáticamente en `electron/server/db/`
- Los datos se guardan localmente en tu máquina
- La aplicación funciona completamente offline
- El servidor Express debe estar corriendo para que la app funcione
