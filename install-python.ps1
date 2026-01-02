# Script para instalar Python y configurar npm para better-sqlite3
# Ejecutar como Administrador: Right-click > "Ejecutar con PowerShell"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Instalador de Python para better-sqlite3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Python ya está instalado
Write-Host "[1/3] Verificando instalación de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python encontrado: $pythonVersion" -ForegroundColor Green
    Write-Host ""
    Write-Host "Python ya está instalado. Configurando npm..." -ForegroundColor Cyan
    npm config set python $(Get-Command python | Select-Object -ExpandProperty Source)
    Write-Host "✓ npm configurado para usar Python" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora puedes ejecutar: npm install" -ForegroundColor Green
    Read-Host "Presiona Enter para cerrar"
    exit 0
} catch {
    Write-Host "✗ Python no encontrado en PATH" -ForegroundColor Red
}

Write-Host ""
Write-Host "[2/3] Opciones de instalación:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opción 1: Instalar desde Microsoft Store (RECOMENDADO - Más rápido)" -ForegroundColor Cyan
Write-Host "  - Abre Microsoft Store" -ForegroundColor White
Write-Host "  - Busca 'Python 3.11' o 'Python 3.12'" -ForegroundColor White
Write-Host "  - Haz clic en 'Obtener' o 'Instalar'" -ForegroundColor White
Write-Host "  - Espera a que se complete la instalación" -ForegroundColor White
Write-Host "  - Cierra y vuelve a abrir PowerShell" -ForegroundColor White
Write-Host ""
Write-Host "Opción 2: Instalar desde python.org (Más control)" -ForegroundColor Cyan
Write-Host "  - Visita: https://www.python.org/downloads/" -ForegroundColor White
Write-Host "  - Descarga Python 3.11 o superior" -ForegroundColor White
Write-Host "  - Durante la instalación, MARCA la casilla 'Add Python to PATH'" -ForegroundColor Yellow
Write-Host "  - Completa la instalación" -ForegroundColor White
Write-Host "  - Cierra y vuelve a abrir PowerShell" -ForegroundColor White
Write-Host ""
Write-Host "Opción 3: Instalar Visual Studio Build Tools (Solución completa)" -ForegroundColor Cyan
Write-Host "  - Visita: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022" -ForegroundColor White
Write-Host "  - Descarga 'Build Tools for Visual Studio 2022'" -ForegroundColor White
Write-Host "  - Instala con 'Desarrollo para el escritorio con C++'" -ForegroundColor White
Write-Host ""

$choice = Read-Host "¿Quieres abrir Microsoft Store ahora? (S/N)"

if ($choice -eq "S" -or $choice -eq "s") {
    Write-Host ""
    Write-Host "Abriendo Microsoft Store..." -ForegroundColor Yellow
    Start-Process "ms-windows-store://pdp/?ProductId=9NRWMJP3717K"  # Python 3.11
    Write-Host ""
    Write-Host "Después de instalar Python desde Microsoft Store:" -ForegroundColor Yellow
    Write-Host "1. Cierra esta ventana de PowerShell" -ForegroundColor White
    Write-Host "2. Cierra y vuelve a abrir PowerShell (normal, no como admin)" -ForegroundColor White
    Write-Host "3. Ejecuta: python --version (para verificar)" -ForegroundColor White
    Write-Host "4. Ejecuta: npm install" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Por favor, instala Python usando una de las opciones anteriores." -ForegroundColor Yellow
    Write-Host "Después de instalar, ejecuta este script nuevamente o:" -ForegroundColor Yellow
    Write-Host "1. Cierra y vuelve a abrir PowerShell" -ForegroundColor White
    Write-Host "2. Ejecuta: python --version (para verificar)" -ForegroundColor White
    Write-Host "3. Ejecuta: npm install" -ForegroundColor White
}

Write-Host ""
Read-Host "Presiona Enter para cerrar"







