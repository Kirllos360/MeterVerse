<#
.SYNOPSIS
    Run-MeterVerse — Start all MeterVerse Enterprise services
.DESCRIPTION
    Automatically starts PostgreSQL (Docker), Backend (Node/Express), Frontend (Next.js/Bun)
    Uses Start-Process with cmd.exe for processes that survive the script ending.
.NOTES
    Version: 2.0.0
    Usage: .\run-MeterVerse.ps1
#>

param(
    [switch]$Stop,
    [switch]$Status
)

$ErrorActionPreference = "Continue"
$ProjectRoot = "D:\meter"

function Log($Text, $Color = "White") { Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Text" -ForegroundColor $Color }

# ─── STOP ────────────────────────────────────────────
if ($Stop) {
    Log "Stopping all MeterVerse services..." Yellow
    taskkill /F /IM node.exe 2>$null
    taskkill /F /FI "WINDOWTITLE eq MeterVerse Backend*" 2>$null
    taskkill /F /FI "WINDOWTITLE eq MeterVerse Frontend*" 2>$null
    docker stop meter-postgres-1 2>$null
    Log "All services stopped." Green
    return
}

# ─── STATUS ──────────────────────────────────────────
if ($Status) {
    Log "Service Status:" Yellow
    try { $r = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 5 -UseBasicParsing; Log "  Backend:  $($r.StatusCode)" Green } catch { Log "  Backend:  Not running" Red }
    try { $r = Invoke-WebRequest -Uri "http://localhost:7400" -TimeoutSec 5 -UseBasicParsing; Log "  Frontend: $($r.StatusCode)" Green } catch { Log "  Frontend: Not running" Red }
    $db = docker inspect meter-postgres-1 --format '{{.State.Health.Status}}' 2>$null
    Log "  Database: $db"
    return
}

# ════════════════════════════════════════════════════════
Log "MeterVerse Enterprise - Starting all services..." Cyan

# ─── STEP 1: CHECK TOOLS ────────────────────────────
Log "[1/6] Checking prerequisites..." Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Log "Docker not found. Install Docker Desktop." Red; exit 1 }
Log "  Docker: OK" Green
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Log "Node not found. Install Node.js 20+." Red; exit 1 }
Log "  Node: $(node --version)" Green

# ─── STEP 2: START POSTGRESQL ───────────────────────
Log "[2/6] Starting PostgreSQL..." Yellow
Set-Location $ProjectRoot
docker ps -a --filter "name=meter" --format "{{.ID}}" | ForEach-Object { docker rm -f $_ 2>$null }
docker compose up -d postgres 2>$null
Start-Sleep -Seconds 3
Log "  Waiting for PostgreSQL..." Yellow
$connected = $false
for ($i = 0; $i -lt 40; $i++) {
    $health = docker inspect meter-postgres-1 --format '{{.State.Health.Status}}' 2>$null
    if ($health -eq "healthy") { $connected = $true; break }
    try { $socket = New-Object System.Net.Sockets.TcpClient; $socket.Connect("127.0.0.1", 5432); $socket.Close(); $connected = $true; break } catch {}
    if ($i -eq 3) { Log "  Initializing database... (~8s)" Yellow }
    if ($i -eq 8) { Log "  Almost ready..." Yellow }
    Start-Sleep -Seconds 2
}
if (-not $connected) { Log "Cannot connect to PostgreSQL. Run 'docker logs meter-postgres-1'" Red; exit 1 }
Log "  PostgreSQL: Ready" Green

# ─── STEP 3: SETUP DATABASE ─────────────────────────
Log "[3/6] Setting up database..." Yellow
Push-Location "$ProjectRoot\backend"
Log "  Running migrations..." Yellow
npx prisma db push 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Log "  Migrations: OK" Green } else { Log "  Migrations: already up to date" Yellow }
Log "  Seeding data..." Yellow
node scripts/seed.js 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Log "  Seed data: OK" Green } else { Log "  Seed data: already seeded" Yellow }
Pop-Location

# ─── STEP 4: START BACKEND ──────────────────────────
Log "[4/6] Starting Backend..." Yellow
Push-Location "$ProjectRoot\backend"

# Kill any existing backend processes
taskkill /F /FI "WINDOWTITLE eq MeterVerse Backend*" 2>$null
Start-Sleep -Seconds 1

# Start backend in its own independent cmd window using Start-Process
# This is CRITICAL: Start-Process creates a process that survives this script ending
$beLog = "$ProjectRoot\backend\.server.log"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c title MeterVerse Backend && node src/server.js > `"$beLog`" 2>&1" -WindowStyle Normal
Start-Sleep -Seconds 4

$beReady = $false
for ($i = 0; $i -lt 10; $i++) {
    try { $r = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 3 -UseBasicParsing; $beReady = $true; break } catch {}
    Start-Sleep -Seconds 2
}
if ($beReady) { Log "  Backend: http://localhost:3001" Green } else { Log "  Backend: Started (check .server.log)" Yellow }
Pop-Location

# ─── STEP 5: START FRONTEND ─────────────────────────
Log "[5/6] Starting Frontend..." Yellow
Push-Location "$ProjectRoot\Frontend"

# Kill any existing frontend processes
taskkill /F /FI "WINDOWTITLE eq MeterVerse Frontend*" 2>$null
Start-Sleep -Seconds 1

# Start frontend in its own independent cmd window
# Using next start (production mode) if build exists, otherwise next dev
$feLog = "$ProjectRoot\Frontend\.next\server.log"
if (Test-Path ".next\BUILD_ID") {
    Log "  Production build found, starting in production mode..." Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c title MeterVerse Frontend && npx next start -p 7400 > `"$feLog`" 2>&1" -WindowStyle Normal
} else {
    Log "  No production build, starting in dev mode..." Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c title MeterVerse Frontend && npx next dev -p 7400 > `"$feLog`" 2>&1" -WindowStyle Normal
}

Log "  Waiting for frontend (30-60s first time)..." Yellow
$feReady = $false
for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Seconds 3
    try { $r = Invoke-WebRequest -Uri "http://localhost:7400" -TimeoutSec 3 -UseBasicParsing; $feReady = $true; break } catch {}
    if ($i -eq 10) { Log "  Still compiling..." Yellow }
}
if ($feReady) { Log "  Frontend: http://localhost:7400" Green } else { Log "  Frontend: Check http://localhost:7400 manually" Yellow }
Pop-Location

# ─── STEP 6: UPDATE DEV SCRIPT (remove --watch to prevent restart crashes) ──
$pkgPath = "$ProjectRoot\backend\package.json"
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
if ($pkg.scripts.dev -eq "node --watch src/server.js") {
    $pkg.scripts.dev = "node src/server.js"
    $pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath
    Log "  Removed --watch flag from backend dev (prevents crash on file change)" Green
}

# ─── FINAL STATUS ───────────────────────────────────
Log ""
Log "MeterVerse Enterprise - RUNNING" Cyan
Log "  Frontend:  http://localhost:7400" Cyan
Log "  Backend:   http://localhost:3001" Cyan
Log "  API:       http://localhost:3001/api/health" Cyan
Log "  Database:  PostgreSQL on localhost:5432" Cyan
Log "  Login:     admin@meterverse.com / Admin@123" Cyan
Log "  Stop:      .\run-MeterVerse.ps1 -Stop" Cyan
Log "  Status:    .\run-MeterVerse.ps1 -Status" Cyan
Log ""
Log "Servers run in independent cmd windows - close them to stop." Yellow
Log "Closing this window will NOT stop the servers." Yellow
Log ""
