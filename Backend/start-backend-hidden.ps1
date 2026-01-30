# Start NagarSewa Backend Server (Hidden Mode - No PowerShell Window)

$BackendPath = "C:\NagarSewa\Backend"
Set-Location $BackendPath

Write-Host "🔄 Starting backend server in hidden mode..." -ForegroundColor Cyan

# Kill any existing processes on port 2026
$processes = Get-NetTCPConnection -LocalPort 2026 -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($proc in $processes) {
        Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✅ Stopped existing backend processes" -ForegroundColor Yellow
    Start-Sleep -Seconds 1
}

# Start backend server completely hidden (no window at all)
$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = "node"
$processInfo.Arguments = "src\server.js"
$processInfo.WorkingDirectory = $BackendPath
$processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$processInfo.CreateNoWindow = $true
$processInfo.UseShellExecute = $false

$process = [System.Diagnostics.Process]::Start($processInfo)

Write-Host "✅ Backend server started (PID: $($process.Id))" -ForegroundColor Green
Write-Host "🌐 Server running on http://localhost:2026" -ForegroundColor Green
Write-Host "💡 To stop: Stop-Process -Id $($process.Id)" -ForegroundColor Gray

Start-Sleep -Seconds 2

# Verify server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:2026/api/health" -Method GET -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Host "✅ Server health check passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Server may still be starting up..." -ForegroundColor Yellow
}
