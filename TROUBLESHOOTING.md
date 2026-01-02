# 🔧 Solución: Error de Instalación de better-sqlite3

## ⚠️ Problema Principal
`better-sqlite3` requiere compilación nativa y está fallando en Windows porque:
1. **Python no está instalado** o no está en el PATH
2. **Node.js v22.21.0** no tiene binarios precompilados disponibles
3. **node-gyp** necesita Python >=3.6.0 para compilar módulos nativos

## 🔍 Error Típico
```
gyp ERR! find Python Python is not set from command line or npm configuration
gyp ERR! find Python - version is "" - should be >=3.6.0
gyp ERR! find Python - THIS VERSION OF PYTHON IS NOT SUPPORTED
gyp ERR! stack Error: Could not find any Python installation to use
```

## ✅ Soluciones (en orden de preferencia)

### ⚡ Opción 0: Instalar Python desde Microsoft Store (MÁS RÁPIDO)

**Esta es la solución más rápida y sencilla:**

1. **Abrir Microsoft Store**:
   - Presiona `Win + R`, escribe `ms-windows-store:` y presiona Enter
   - O busca "Microsoft Store" en el menú de inicio

2. **Buscar e instalar Python**:
   - Busca "Python 3.11" o "Python 3.12"
   - Haz clic en "Obtener" o "Instalar"
   - Espera a que se complete la instalación

3. **Cerrar y abrir PowerShell nuevamente** (importante para actualizar PATH)

4. **Verificar instalación**:
   ```powershell
   python --version
   ```

5. **Instalar dependencias**:
   ```powershell
   npm install
   ```

**Alternativa**: Ejecuta el script `install-python.ps1` que abrirá Microsoft Store automáticamente.

### Opción 1: Instalar Herramientas de Compilación (RECOMENDADO para desarrollo)

Abre **PowerShell como Administrador** y ejecuta:

```powershell
npm install --global windows-build-tools
```

O instala **Visual Studio Build Tools** manualmente:
1. Descarga: https://visualstudio.microsoft.com/downloads/
2. Instala "Build Tools for Visual Studio 2022"
3. Selecciona "Desktop development with C++"

Luego ejecuta:
```cmd
npm install
```

### Opción 2: Instalar Python desde python.org

Si prefieres más control sobre la instalación:

1. **Descargar Python**:
   - Visita: https://www.python.org/downloads/
   - Descarga Python 3.11 o superior
   - **IMPORTANTE**: Durante la instalación, marca la casilla **"Add Python to PATH"**

2. **Verificar instalación**:
   ```powershell
   python --version
   ```

3. **Instalar dependencias**:
   ```powershell
   npm install
   ```

### Opción 3: Usar Versión Precompilada (NO FUNCIONA con Node.js v22)

⚠️ **Nota**: Esta opción NO funciona con Node.js v22.21.0 porque no hay binarios precompilados disponibles.

Si estás usando Node.js v18 o v20:
```cmd
npm install better-sqlite3 --build-from-source=false
```

### Opción 4: Mover Proyecto Fuera de OneDrive

El problema puede ser OneDrive sincronizando archivos durante la instalación.

```cmd
# 1. Mueve el proyecto a C:\
xcopy "C:\Users\Juan\OneDrive\Desktop\Vencedora Despachos" "C:\Vencedora-Despachos" /E /I /H

# 2. Navega al nuevo directorio
cd C:\Vencedora-Despachos

# 3. Instala dependencias
npm install

# 4. Ejecuta el proyecto
npm run dev
```

### Opción 5: Usar CMD en lugar de PowerShell

```cmd
# Abre CMD (no PowerShell)
cd "C:\Users\Juan\OneDrive\Desktop\Vencedora Despachos"

# Limpia e instala
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
```

### Opción 6: Instalar Dependencias Manualmente

```cmd
# Instala todo excepto better-sqlite3
npm install --ignore-scripts

# Luego intenta solo better-sqlite3
npm install better-sqlite3
```

## 🚀 Después de Instalar

Una vez que `npm install` funcione correctamente:

```cmd
npm run dev
```

Esto abrirá la aplicación Electron automáticamente.

## 📝 Archivos Creados

✅ Todas las páginas React han sido recreadas:
- Login.jsx
- DashboardDespachador.jsx
- DashboardSupervisor.jsx
- DespachosIndex.jsx
- DespachoNuevo.jsx
- DespachoEditar.jsx
- DespachosTodos.jsx

## ⚡ Inicio Rápido (Si la instalación funciona)

```cmd
# Opción 1: Todo en uno
npm run dev

# Opción 2: Comandos separados (3 terminales)
npm run dev:server
npm run dev:vite
npm start
```

## 🆘 Si Nada Funciona

### Opción A: Cambiar a Node.js v18 o v20 LTS

Node.js v22 es muy reciente y algunos paquetes aún no tienen soporte completo:

1. **Descargar Node.js v20 LTS**: https://nodejs.org/ (recomendado)
   - O Node.js v18 LTS si prefieres una versión más estable
2. **Instalar y reiniciar** PowerShell/Terminal
3. **Verificar versión**:
   ```powershell
   node --version
   ```
4. **Limpiar e instalar**:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm cache clean --force
   npm install
   ```

### Opción B: Configurar Python Manualmente

Si Python está instalado pero no está en el PATH:

1. **Encontrar la ruta de Python**:
   ```powershell
   # Buscar Python instalado
   Get-ChildItem -Path "C:\Users\$env:USERNAME\AppData\Local\Programs\Python" -Recurse -Filter "python.exe" -ErrorAction SilentlyContinue
   ```

2. **Configurar npm para usar esa ruta**:
   ```powershell
   npm config set python "C:\Ruta\Completa\A\python.exe"
   ```

3. **Verificar configuración**:
   ```powershell
   npm config get python
   ```

4. **Instalar dependencias**:
   ```powershell
   npm install
   ```

## 📚 Documentación Adicional

- **SOLUCION_PYTHON.md**: Guía completa sobre problemas de Python/node-gyp
- **install-python.ps1**: Script automatizado para instalar Python
- **fix-installation.ps1**: Script para resolver problemas de PowerShell y configuración
