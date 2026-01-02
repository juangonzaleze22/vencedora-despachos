# Script para resolver problemas de instalación en Windows
# Ejecutar como Administrador: Right-click > "Ejecutar con PowerShell"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Solución de Problemas de Instalación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar y cambiar Execution Policy
Write-Host "[1/4] Configurando política de ejecución de PowerShell..." -ForegroundColor Yellow
$currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
Write-Host "Política actual: $currentPolicy" -ForegroundColor Gray

if ($currentPolicy -eq "Restricted" -or $currentPolicy -eq "AllSigned") {
    Write-Host "Cambiando política a RemoteSigned..." -ForegroundColor Yellow
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "✓ Política cambiada exitosamente" -ForegroundColor Green
} else {
    Write-Host "✓ Política ya está configurada correctamente" -ForegroundColor Green
}

Write-Host ""

# 2. Verificar Python
Write-Host "[2/4] Verificando instalación de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python encontrado: $pythonVersion" -ForegroundColor Green
    $pythonFound = $true
} catch {
    Write-Host "✗ Python no encontrado en PATH" -ForegroundColor Red
    $pythonFound = $false
    
    # Buscar Python en ubicaciones comunes
    Write-Host "Buscando Python en ubicaciones comunes..." -ForegroundColor Yellow
    $pythonPaths = @(
        "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python310\python.exe",
        "C:\Program Files\Python311\python.exe",
        "C:\Program Files\Python310\python.exe"
    )
    
    foreach ($path in $pythonPaths) {
        if (Test-Path $path) {
            Write-Host "  Encontrado: $path" -ForegroundColor Cyan
            Write-Host "  Configurando npm para usar este Python..." -ForegroundColor Yellow
            npm config set python $path
            Write-Host "  ✓ Configurado" -ForegroundColor Green
            $pythonFound = $true
            break
        }
    }
}

if (-not $pythonFound) {
    Write-Host ""
    Write-Host "⚠ ADVERTENCIA: Python no está disponible" -ForegroundColor Yellow
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  1. Instalar Python desde https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host "     (Asegúrate de marcar 'Add Python to PATH' durante la instalación)" -ForegroundColor Gray
    Write-Host "  2. Instalar Visual Studio Build Tools desde:" -ForegroundColor Cyan
    Write-Host "     https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""

# 3. Configurar npm para usar prebuilds (evita compilación)
Write-Host "[3/4] Configurando npm para usar binarios precompilados..." -ForegroundColor Yellow
npm config set build-from-source false
Write-Host "✓ Configurado para usar prebuilds cuando sea posible" -ForegroundColor Green

Write-Host ""

# 4. Limpiar caché de npm
Write-Host "[4/4] Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✓ Caché limpiado" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuración completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Cierra esta ventana de PowerShell" -ForegroundColor White
Write-Host "2. Abre una nueva ventana de PowerShell (normal, no como admin)" -ForegroundColor White
Write-Host "3. Navega a la carpeta del proyecto" -ForegroundColor White
Write-Host "4. Ejecuta: npm install" -ForegroundColor White
Write-Host ""
Write-Host "Si aún tienes problemas, consulta SOLUCION_PYTHON.md" -ForegroundColor Gray
Write-Host ""

# Pausar para que el usuario pueda leer
Read-Host "Presiona Enter para cerrar"

