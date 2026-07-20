<#
.SYNOPSIS
    MeterVerse Watchdog — Self-healing service manager
.DESCRIPTION
    Runs backend + frontend in a single console.
    Monitors health every 10s, auto-restarts on crash (max 5 attempts).
    Logs everything, shows status, rechecks every 60s if stuck.
#>

param([switch]$Stop)

$ErrorActionPreference = "Continue"
$Root = "D:\meter"
$LogFile = "$Root\.watchdog.log"
$MaxRetries = 5
$HealthInterval = 10
$StuckInterval = 60

# ─── HELPERS ──────────────────────────────────────────────────────────────────
function Log($T, $C = "White") { $msg = "[$(Get-Date -Format 'HH:mm:ss')] $T"; Write-Host $msg -ForegroundColor $C; Add-Content -Path $LogFile -Value $msg }

function Get-Status {
    $be = $false; $fe = $false
    try { $r = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; $be = $r.Content -match '"status":"ok"' } catch {}
    try { $r = Invoke-WebRequest -Uri "http://localhost:7400" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; $fe = $r.StatusCode -eq 200 } catch {}
    return @{ Backend = $be; Frontend = $fe }
}

function Start-Backend {
    $proc = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" }
    if ($proc) { Log "Backend already running (PID $($proc.Id))" Yellow; return $proc.Id }
    $p = Start-Process -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory "$Root\backend" -PassThru -WindowStyle Hidden -RedirectStandardOutput "$Root\.be_out.log" -RedirectStandardError "$Root\.be_err.log"
    Start-Sleep 3; Log "Backend started (PID $($p.Id))" Green; return $p.Id
}

function Start-Frontend {
    $proc = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" }
    if ($proc) { Log "Frontend already running (PID $($proc.Id))" Yellow; return $proc.Id }
    if (Test-Path "$Root\Frontend\.next\BUILD_ID") {
        $p = Start-Process -FilePath "npx" -ArgumentList "next start -p 7400" -WorkingDirectory "$Root\Frontend" -PassThru -WindowStyle Hidden -RedirectStandardOutput "$Root\.fe_out.log" -RedirectStandardError "$Root\.fe_err.log"
    } else {
        $p = Start-Process -FilePath "npx" -ArgumentList "next dev -p 7400" -WorkingDirectory "$Root\Frontend" -PassThru -WindowStyle Hidden -RedirectStandardOutput "$Root\.fe_out.log" -RedirectStandardError "$Root\.fe_err.log"
    }
    Start-Sleep 8; Log "Frontend started (PID $($p.Id))" Green; return $p.Id
}

# ─── STOP ──────────────────────────────────────────────────────────────────────
if ($Stop) {
    Log "Stopping all services..." Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Log "All services stopped." Green; return
}

# ════════════════════════════════════════════════════════════════════════════════
Clear-Host
$host.UI.RawUI.WindowTitle = "MeterVerse Watchdog"
Log "══════════════════════════════════════════════════" Cyan
Log "  METERVERSE WATCHDOG v2 — Self-Healing Manager" Cyan
Log "══════════════════════════════════════════════════" Cyan
Log "  Backend:  http://localhost:3001" Cyan
Log "  Frontend: http://localhost:7400" Cyan
Log "  Log:      $LogFile" Cyan
Log "══════════════════════════════════════════════════" Cyan
Log ""

$retries = @{ Backend = 0; Frontend = 0 }
$lastError = @{ Backend = $null; Frontend = $null }

# Initial start
Log "[START] Launching services..." Yellow
$bePID = Start-Backend
$fePID = Start-Frontend

# Wait for initial readiness
Start-Sleep 5

# ─── MAIN LOOP ─────────────────────────────────────────────────────────────────
while ($true) {
    $status = Get-Status
    $now = Get-Date -Format "HH:mm:ss"
    
    # ─── HEADER ──────────────────────────────────────────────────────────────────
    $host.UI.RawUI.WindowTitle = "MeterVerse Watchdog — BE:$($status.Backend) FE:$($status.Frontend) — $now"
    Write-Host "`n[$now] ──── Status ────" -ForegroundColor Cyan
    Write-Host "  Backend:  $(if($status.Backend){'✅ RUNNING'}else{'❌ DOWN'}) (retry $($retries.Backend)/$MaxRetries)" -ForegroundColor $(if($status.Backend){'Green'}else{'Red'})
    Write-Host "  Frontend: $(if($status.Frontend){'✅ RUNNING'}else{'❌ DOWN'}) (retry $($retries.Frontend)/$MaxRetries)" -ForegroundColor $(if($status.Frontend){'Green'}else{'Red'})
    
    # ─── HEALTHY ─────────────────────────────────────────────────────────────────
    if ($status.Backend -and $status.Frontend) {
        $retries.Backend = 0; $retries.Frontend = 0
        $lastError.Backend = $null; $lastError.Frontend = $null
        Write-Host "  ✅ ALL SERVICES OPERATIONAL" -ForegroundColor Green
        Write-Host "  ⏱  Next check in ${HealthInterval}s. Press Q to quit." -ForegroundColor DarkGray
        
        $timer = 0
        while ($timer -lt $HealthInterval) {
            Start-Sleep 1; $timer++
            if ([Console]::KeyAvailable) {
                $key = [Console]::ReadKey($true)
                if ($key.Key -eq "Q") { Log "User requested stop." Yellow; Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force; Log "Stopped." Green; return }
            }
        }
        continue
    }
    
    # ─── RECOVERY ────────────────────────────────────────────────────────────────
    if (-not $status.Backend) {
        $retries.Backend++
        $errLog = Get-Content "$Root\.be_err.log" -ErrorAction SilentlyContinue -Tail 3
        $lastError.Backend = $errLog -join " | "
        Log "⚠️  Backend DOWN (attempt $($retries.Backend)/$MaxRetries)" Red
        if ($retries.Backend -le $MaxRetries) {
            Log "  Restarting backend..." Yellow
            Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep 2; $bePID = Start-Backend
        } else {
            Log "❌ Backend failed after $MaxRetries attempts. Waiting for fix..." Red
            Log "  Last error: $($lastError.Backend)" DarkYellow
        }
    }
    
    if (-not $status.Frontend) {
        $retries.Frontend++
        $errLog = Get-Content "$Root\.fe_err.log" -ErrorAction SilentlyContinue -Tail 3
        $lastError.Frontend = $errLog -join " | "
        Log "⚠️  Frontend DOWN (attempt $($retries.Frontend)/$MaxRetries)" Red
        if ($retries.Frontend -le $MaxRetries) {
            Log "  Restarting frontend..." Yellow
            Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep 3; $fePID = Start-Frontend
        } else {
            Log "❌ Frontend failed after $MaxRetries attempts. Waiting for fix..." Red
            Log "  Last error: $($lastError.Frontend)" DarkYellow
        }
    }
    
    # ─── STUCK? RECHECK EVERY 60s ──────────────────────────────────────────────
    if ($retries.Backend -gt $MaxRetries -or $retries.Frontend -gt $MaxRetries) {
        Write-Host "  ⏱  Max retries reached. Rechecking in ${StuckInterval}s..." -ForegroundColor Yellow
        $timer = 0
        while ($timer -lt $StuckInterval) {
            Start-Sleep 1; $timer++
            # Quick recheck — maybe error resolved itself
            if ($timer % 10 -eq 0) {
                $quick = Get-Status
                if ($quick.Backend -and $quick.Frontend) {
                    Log "✅ Services recovered on their own! Resetting retry counters." Green
                    $retries.Backend = 0; $retries.Frontend = 0
                    break
                }
            }
            if ([Console]::KeyAvailable) {
                $key = [Console]::ReadKey($true)
                if ($key.Key -eq "Q") { Log "User requested stop." Yellow; Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force; Log "Stopped." Green; return }
                if ($key.Key -eq "R") { Log "Manual retry requested." Yellow; $retries.Backend = 0; $retries.Frontend = 0 }
            }
        }
    }
}
