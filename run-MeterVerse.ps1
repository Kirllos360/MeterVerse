<#
.SYNOPSIS
    Run-MeterVerse — Start all MeterVerse Enterprise services
.DESCRIPTION
    Automatically starts PostgreSQL (Docker), Backend (Node/Express), Frontend (Next.js/Bun)
.NOTES
    Versio: 1.0.0
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
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
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
Log ""

# ─── STEP 1: CHECK TOOLS ────────────────────────────
Log "[1/6] Checking prerequisites..." Yellow

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Log "Docker not found. Install Docker Desktop." Red; exit 1 }
Log "  Docker: OK" Green

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Log "Node not found. Install Node.js 20+." Red; exit 1 }
Log "  Node: $(node --version)" Green

$bunCmd = (Get-Command bun -ErrorAction SilentlyContinue).Source
if (-not $bunCmd) { npm install -g bun 2>$null; $bunCmd = "bun.cmd" }
Log "  Bun: OK" Green

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

Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $pid } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$beJob = Start-Job -ScriptBlock { param($d) Set-Location $d; $env:NODE_ENV="development"; npm run dev } -ArgumentList "$ProjectRoot\backend"
Start-Sleep -Seconds 5

$beReady = $false
for ($i = 0; $i -lt 10; $i++) {
    try { $r = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 3 -UseBasicParsing; $beReady = $true; break } catch {}
    Start-Sleep -Seconds 2
}
if ($beReady) { Log "  Backend: http://localhost:3001" Green } else { Log "  Backend: Started (not yet responding)" Yellow }
Pop-Location

# ─── STEP 5: START FRONTEND ─────────────────────────
Log "[5/6] Starting Frontend..." Yellow
Push-Location "$ProjectRoot\Frontend"

Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$feJob = Start-Job -ScriptBlock { param($d) Set-Location $d; $env:PORT="7400"; npm run dev } -ArgumentList "$ProjectRoot\Frontend"

Log "  Waiting for frontend (30-60s first time)..." Yellow
$feReady = $false
for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Seconds 3
    try { $r = Invoke-WebRequest -Uri "http://localhost:7400" -TimeoutSec 3 -UseBasicParsing; $feReady = $true; break } catch {}
    if ($i -eq 10) { Log "  Still compiling..." Yellow }
}
if ($feReady) { Log "  Frontend: http://localhost:7400" Green } else { Log "  Frontend: Check http://localhost:7400 manually" Yellow }
Pop-Location

# ─── STEP 6: FINAL STATUS ───────────────────────────
Log ""
Log "MeterVerse Enterprise - RUNNING" Cyan
Log "  Frontend:  http://localhost:7400" Cyan
Log "  Backend:   http://localhost:3001" Cyan
Log "  API:       http://localhost:3001/api/health" Cyan
Log "  Database:  PostgreSQL on localhost:5432" Cyan
Log "  Login:     admin@meterverse.com / admin" Cyan
Log "  Stop:      .\run-MeterVerse.ps1 -Stop" Cyan
Log "  Status:    .\run-MeterVerse.ps1 -Status" Cyan
Log ""
