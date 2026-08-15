# METERVERSE OS - Start All Services (detached, hidden, survives)
# Launches 4 services as independent hidden processes. Native PostgreSQL only.
# Usage: powershell -ExecutionPolicy Bypass -File _tools\StartAll.ps1

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $PSScriptRoot 'logs'
if (-not (Test-Path $logs)) { New-Item -ItemType Directory -Path $logs -Force | Out-Null }

function Start-Hidden($name, $file, $args, $log, $workdir) {
    $p = Start-Process -FilePath $file -ArgumentList $args -WorkingDirectory $workdir -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError ($log + '.err') -PassThru
    Write-Host "[$name] started PID $($p.Id)"
    return $p
}

Write-Host "============================================================"
Write-Host "  METERVERSE OS - Starting all services (detached)"
Write-Host "  Native DB :5433  (NOT Docker)"
Write-Host "============================================================"

# DB check
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect('127.0.0.1', 5433)
    $tcp.Close()
    Write-Host "[DB] PostgreSQL :5433 RUNNING"
} catch {
    Write-Host "[DB] WARNING: PostgreSQL not detected on :5433 (start: net start postgresql-x64-18)"
}

$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'Frontend'

# 1. Admin Backend :3131 (cmd with explicit PORT, working dir = backend, hidden)
Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c','cd /d', $backend, '&&', 'set', 'PORT=3131', '&&', 'node', 'src/server.js', '>>', (Join-Path $logs 'backend.log'), '2>&1') -WindowStyle Hidden | Out-Null
Write-Host "[Admin BE] started :3131"

# 2. Portal Backend :3003 (PORT=3003 + PORTAL_MODE=1, working dir = backend)
Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c','cd /d', $backend, '&&', 'set', 'PORT=3003', '&&', 'set', 'PORTAL_MODE=1', '&&', 'node', 'src/server.js', '>>', (Join-Path $logs 'portal-be.log'), '2>&1') -WindowStyle Hidden | Out-Null
Write-Host "[Portal BE] started :3003"

# 3. Admin FE :3535 (production start if build exists, else dev)
$adminBuild = Join-Path $frontend '.next\BUILD_ID'
if (Test-Path $adminBuild) {
    Start-Process -FilePath (Join-Path $frontend 'node_modules\.bin\next.cmd') -ArgumentList @('start','-p','3535') -WorkingDirectory $frontend -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'frontend.log') -RedirectStandardError (Join-Path $logs 'frontend.log.err') | Out-Null
    Write-Host "[Admin FE] start (production) :3535"
} else {
    Write-Host "[Admin FE] WARN no build, using dev :3535"
    Start-Process -FilePath (Join-Path $frontend 'node_modules\.bin\next.cmd') -ArgumentList @('dev','-p','3535') -WorkingDirectory $frontend -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'frontend.log') -RedirectStandardError (Join-Path $logs 'frontend.log.err') | Out-Null
}

# 4. Portal FE :3030
$portalBuild = Join-Path $frontend '.next-portal\BUILD_ID'
if (Test-Path $portalBuild) {
    Start-Process -FilePath (Join-Path $frontend 'node_modules\.bin\next.cmd') -ArgumentList @('start','-p','3030') -WorkingDirectory $frontend -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'portal-fe.log') -RedirectStandardError (Join-Path $logs 'portal-fe.log.err') | Out-Null
    Write-Host "[Portal FE] start (production) :3030"
} else {
    Write-Host "[Portal FE] WARN no build, using dev :3030"
    Start-Process -FilePath (Join-Path $frontend 'node_modules\.bin\next.cmd') -ArgumentList @('dev','-p','3030') -WorkingDirectory $frontend -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'portal-fe.log') -RedirectStandardError (Join-Path $logs 'portal-fe.log.err') | Out-Null
}

# Wait for admin BE health
Write-Host "Waiting up to 90s for services..."
$deadline = (Get-Date).AddSeconds(90)
$ok = $false
while ((Get-Date) -lt $deadline -and -not $ok) {
    try {
        $r = Invoke-WebRequest -Uri 'http://localhost:3131/api/health' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $ok = $true }
    } catch { }
    if (-not $ok) { Start-Sleep -Seconds 2 }
}

Write-Host "============================================================"
Write-Host "  METERVERSE OS - SERVICES STARTED (detached)"
Write-Host "  Admin:   http://localhost:3535/admin"
Write-Host "  Portal:  http://localhost:3030/"
Write-Host "  API:     3131 (admin)  3003 (portal)   DB: 5433 (native)"
Write-Host "  Logs:    $logs"
Write-Host "============================================================"
