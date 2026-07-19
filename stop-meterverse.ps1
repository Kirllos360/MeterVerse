<#
.SYNOPSIS
    MeterVerse Enterprise - Stop all services
.DESCRIPTION
    Stops backend, frontend, and PostgreSQL containers
#>

Write-Host "Stopping MeterVerse services..." -ForegroundColor Yellow

# Stop frontend
$fe = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" -or $_.Path -like "*Frontend*" }
if ($fe) { $fe | Stop-Process -Force; Write-Host "  ✓ Frontend stopped" -ForegroundColor Green } else { Write-Host "  - Frontend not running" -ForegroundColor Gray }

# Stop backend
$be = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*backend*" -or $_.Path -like "*backend*" }
if ($be) { $be | Stop-Process -Force; Write-Host "  ✓ Backend stopped" -ForegroundColor Green } else { Write-Host "  - Backend not running" -ForegroundColor Gray }

# Stop PostgreSQL
docker stop meter-postgres-1 2>$null | Out-Null
Write-Host "  ✓ PostgreSQL stopped" -ForegroundColor Green

Write-Host "`nAll services stopped." -ForegroundColor Green