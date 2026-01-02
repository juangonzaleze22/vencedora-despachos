# Solución para Error de Python/node-gyp

## ⚠️ Problema Específico: Node.js v22.21.0

Si estás usando **Node.js v22.21.0** o superior, `better-sqlite3` **NO tiene binarios precompilados** para esta versión aún. Por lo tanto, **DEBES instalar Python y herramientas de compilación** para que funcione.

**Solución más rápida**: Instalar Python desde Microsoft Store (ver Opción 1 más abajo)

## Problemas Detectados

1. **Python no disponible**: El paquete `better-sqlite3` requiere compilación nativa con node-gyp, que necesita Python y herramientas de compilación de C++ en Windows.

2. **PowerShell Execution Policy**: La política de ejecución de scripts está deshabilitada, lo que impide ejecutar npm correctamente.

3. **Node.js v22+ sin binarios precompilados**: Las versiones muy recientes de Node.js pueden no tener binarios precompilados disponibles.

## Solución Inmediata: Habilitar Ejecución de Scripts en PowerShell

**IMPORTANTE**: Primero resuelve el problema de PowerShell:

1. **Abrir PowerShell como Administrador**:
   - Presiona `Win + X`
   - Selecciona "Windows PowerShell (Administrador)" o "Terminal (Administrador)"

2. **Cambiar la política de ejecución**:
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Verificar el cambio**:
   ```powershell
   Get-ExecutionPolicy
   ```
   Debería mostrar: `RemoteSigned`

4. **Cerrar y abrir PowerShell nuevamente** (no como administrador, solo normal)

Ahora puedes continuar con las soluciones para Python a continuación.

## Soluciones para Python (elige una)

**NOTA**: Asegúrate de haber resuelto primero el problema de PowerShell (ver arriba).

### Opción 0: Instalar Python desde Microsoft Store (MÁS RÁPIDO) ⚡

Esta es la solución más rápida y sencilla:

1. **Abrir Microsoft Store**:
   - Presiona `Win + R`
   - Escribe `ms-windows-store:` y presiona Enter
   - O busca "Microsoft Store" en el menú de inicio

2. **Buscar e instalar Python**:
   - Busca "Python 3.11" o "Python 3.12"
   - Haz clic en "Obtener" o "Instalar"
   - Espera a que se complete la instalación (puede tardar unos minutos)

3. **Cerrar y abrir PowerShell nuevamente** (importante para que se actualice el PATH)

4. **Verificar instalación**:
   ```powershell
   python --version
   ```
   Debería mostrar la versión de Python instalada

5. **Instalar dependencias**:
   ```powershell
   npm install
   ```

**Alternativa**: Ejecuta el script `install-python.ps1` que abrirá Microsoft Store automáticamente.

### Opción 1: Instalar Visual Studio Build Tools (RECOMENDADO para desarrollo)

Esta es la solución más completa y recomendada para Windows:

1. **Descargar Visual Studio Build Tools**:
   - Visita: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   - Descarga "Build Tools for Visual Studio 2022"

2. **Instalar con las siguientes cargas de trabajo**:
   - Abre el instalador
   - Selecciona "Desarrollo para el escritorio con C++"
   - Asegúrate de que incluye:
     - MSVC v143 - VS 2022 C++ x64/x86 build tools
     - Windows 10/11 SDK
     - Python development (opcional pero recomendado)

3. **Reiniciar PowerShell/Terminal** después de la instalación

4. **Instalar dependencias**:
   ```bash
   npm install
   ```

### Opción 2: Instalar Python desde python.org

1. **Descargar Python**:
   - Visita: https://www.python.org/downloads/
   - Descarga Python 3.11 o superior
   - **IMPORTANTE**: Durante la instalación, marca la casilla "Add Python to PATH"

2. **Verificar instalación**:
   ```bash
   python --version
   ```

3. **Instalar windows-build-tools** (opcional pero recomendado):
   ```bash
   npm install --global windows-build-tools
   ```
   Nota: Este comando puede tardar varios minutos.

4. **Instalar dependencias**:
   ```bash
   npm install
   ```

### Opción 3: Usar prebuilds de better-sqlite3 (MÁS RÁPIDO)

Si no quieres instalar herramientas de compilación, puedes usar los binarios precompilados:

1. **Configurar npm para usar prebuilds**:
   ```bash
   npm config set target_arch x64
   npm config set target_platform win32
   ```

2. **Instalar con la opción de usar prebuilds**:
   ```bash
   npm install better-sqlite3 --build-from-source=false
   ```

   O instalar todas las dependencias forzando prebuilds:
   ```bash
   npm install --build-from-source=false
   ```

### Opción 4: Configurar Python manualmente

Si ya tienes Python instalado pero no está en el PATH:

1. **Encontrar la ruta de Python**:
   - Busca `python.exe` en tu sistema
   - Las ubicaciones comunes son:
     - `C:\Users\Juan\AppData\Local\Programs\Python\Python311\python.exe`
     - `C:\Program Files\Python311\python.exe`

2. **Configurar npm para usar esa ruta**:
   ```bash
   npm config set python "C:\Users\Juan\AppData\Local\Programs\Python\Python311\python.exe"
   ```

3. **Verificar que funciona**:
   ```bash
   npm config get python
   ```

4. **Instalar dependencias**:
   ```bash
   npm install
   ```

## Verificación

Después de aplicar cualquiera de las soluciones, verifica que funciona:

```bash
# Verificar Python
python --version

# Verificar configuración de npm
npm config get python

# Limpiar caché de npm (opcional)
npm cache clean --force

# Eliminar node_modules y package-lock.json (si es necesario)
rm -r node_modules
rm package-lock.json

# Reinstalar dependencias
npm install
```

## Notas Importantes

- **Visual Studio Build Tools** es la solución más robusta y recomendada
- Si usas **Opción 3** (prebuilds), asegúrate de que tu arquitectura coincida (x64)
- Después de instalar herramientas de compilación, **reinicia tu terminal/PowerShell**
- Si el problema persiste, intenta ejecutar PowerShell como **Administrador**

## Alternativa: Cambiar a otra librería SQLite

Si ninguna solución funciona, podrías considerar cambiar `better-sqlite3` por:
- `sql.js` (SQLite compilado a WebAssembly, no requiere compilación nativa)
- `sqlite3` (versión más antigua pero más estable en Windows)

Pero esto requeriría cambios en el código del proyecto.

