# 📦 Guía de Distribución - Vencedora Despachos

## 🚀 Proceso de Build

Para crear el instalador de la aplicación, ejecuta:

```bash
npm run build
```

Este comando realiza dos pasos:
1. **Build del frontend**: Compila React/Vite en la carpeta `dist/`
2. **Build de Electron**: Empaqueta la aplicación y crea el instalador

## 📁 Archivos Generados

Después del build, encontrarás los archivos en la carpeta **`release/`**:

### Windows
- **`Vencedora Despachos Setup 1.0.0.exe`** ← **ESTE ES EL ARCHIVO QUE DEBES DISTRIBUIR**

Este es el instalador completo que contiene:
- ✅ La aplicación Electron empaquetada
- ✅ Todas las dependencias necesarias
- ✅ El servidor Express incluido
- ✅ SQLite (sql.js) incluido
- ✅ Node.js runtime incluido

## 📤 Qué Distribuir

### Para Instalación en Windows

**Solo necesitas distribuir UN archivo:**

```
Vencedora Despachos Setup 1.0.0.exe
```

Este archivo está ubicado en:
```
release/Vencedora Despachos Setup 1.0.0.exe
```

### ✅ Lo que NO necesitas distribuir

- ❌ `node_modules/` - Ya está incluido en el instalador
- ❌ `src/` - El código fuente ya está compilado
- ❌ `electron/` - Ya está empaquetado
- ❌ `package.json` - Ya está incluido
- ❌ Cualquier otro archivo del proyecto

## 🎯 Instalación en el Cliente

El usuario final solo necesita:

1. **Descargar** el archivo `Vencedora Despachos Setup 1.0.0.exe`
2. **Ejecutar** el instalador (doble clic)
3. **Seguir** el asistente de instalación
4. **Listo** - La aplicación se instalará automáticamente

### Requisitos del Sistema

- **Windows 10 o superior** (64-bit)
- **No requiere** Node.js instalado (está incluido)
- **No requiere** Python instalado (solo era necesario para desarrollo)
- **No requiere** conexión a internet (aplicación offline)

## 📍 Ubicación de Instalación

Por defecto, la aplicación se instala en:
```
C:\Users\[Usuario]\AppData\Local\Programs\vencedora-despachos\
```

La base de datos SQLite se creará automáticamente en:
```
C:\Users\[Usuario]\AppData\Roaming\vencedora-despachos\vencedora-despachos.db
```

## 🔄 Actualizaciones

Para distribuir una nueva versión:

1. Actualiza la versión en `package.json`:
   ```json
   "version": "1.0.1"
   ```

2. Ejecuta el build nuevamente:
   ```bash
   npm run build
   ```

3. Distribuye el nuevo instalador:
   ```
   release/Vencedora Despachos Setup 1.0.1.exe
   ```

## 📝 Notas Importantes

### Base de Datos Compartida

Si quieres que múltiples instancias de la aplicación compartan la misma base de datos, la configuración actual usa una ruta relativa. Para compartir datos entre instalaciones, necesitarías:

1. Modificar `electron/server/index.js` para usar una ruta compartida
2. O usar una ubicación de red compartida

### Tamaño del Instalador

El instalador puede tener un tamaño considerable (100-200 MB) porque incluye:
- Electron runtime (~50 MB)
- Node.js runtime (~30 MB)
- Todas las dependencias npm (~50-100 MB)
- La aplicación compilada (~10-20 MB)

Esto es normal para aplicaciones Electron.

### Firmado Digital (Opcional)

Para producción, considera firmar digitalmente el instalador para evitar advertencias de Windows Defender. Requiere un certificado de código.

## 🐛 Solución de Problemas

### El instalador no se crea

Verifica que:
- ✅ `npm run build:vite` se ejecutó correctamente
- ✅ La carpeta `dist/` existe y tiene contenido
- ✅ Tienes espacio en disco suficiente

### El instalador es muy grande

Es normal. Electron incluye Chromium y Node.js, lo que hace que el instalador sea grande. Esto es un trade-off por tener una aplicación multiplataforma.

### Error al ejecutar la aplicación instalada

- Verifica que Windows Defender no esté bloqueando la aplicación
- Revisa los logs en: `%APPDATA%\vencedora-despachos\logs\`

