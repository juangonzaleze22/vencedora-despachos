# Script para liberar el puerto 3000 en Windows
# Uso: .\scripts\kill-port-3000.ps1

Write-Host "Buscando procesos usando el puerto 3000..." -ForegroundColor Yellow

$processes = netstat -ano | findstr :3000 | Select-String "LISTENING"

if ($processes) {
    $pids = $processes | ForEach-Object {
        $_.ToString().Split()[-1]
    } | Select-Object -Unique

    foreach ($processId in $pids) {
        Write-Host "Terminando proceso con PID: $processId" -ForegroundColor Red
        try {
            taskkill /PID $processId /F
            Write-Host "Proceso $processId terminado correctamente" -ForegroundColor Green
        } catch {
            Write-Host "Error al terminar proceso $processId : $($_)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No hay procesos usando el puerto 3000" -ForegroundColor Green
}

Write-Host ""
Write-Host "Ahora puedes ejecutar npm run dev nuevamente" -ForegroundColor Cyan
