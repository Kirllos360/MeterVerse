param(
  [string]$Url = "http://localhost:3001",
  [string]$Username = "kirllos",
  [string]$Password = "123456"
)

Write-Host "=== Meter Verse Invoice PDF Tool ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check backend
$running = $false
try { $r = Invoke-WebRequest -Uri "$Url/api/v1/health" -Method GET -UseBasicParsing -TimeoutSec 3; if ($r.StatusCode -eq 200) { $running = $true } } catch {}

if (-not $running) {
  Write-Host "[1] Starting backend..." -ForegroundColor Yellow
  $job = Start-Job -ScriptBlock { param($d) cd $d; npm run start:dev } -ArgumentList (Join-Path $PSScriptRoot "..\backend")
  Start-Sleep -Seconds 8
} else {
  Write-Host "[1] Backend already running on $Url" -ForegroundColor Green
}

# 2. Login
Write-Host "[2] Logging in as $Username..." -ForegroundColor Yellow
try {
  $loginBody = @{username=$Username;password=$Password} | ConvertTo-Json
  $login = Invoke-WebRequest -Uri "$Url/api/v1/auth/dev-login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
  $token = ($login.Content | ConvertFrom-Json).access_token
  if (-not $token) { Write-Host "Login failed: no token" -ForegroundColor Red; exit 1 }
  Write-Host "  Token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch { Write-Host "Login error: $_" -ForegroundColor Red; exit 1 }

$headers = @{Authorization="Bearer $token"}

# 3. List invoices
Write-Host "[3] Fetching latest invoices..." -ForegroundColor Yellow
try {
  $invoices = Invoke-RestMethod -Uri "$Url/api/v1/invoices?take=5" -Method GET -Headers $headers -UseBasicParsing
} catch { 
  # fallback: try direct Prisma query via a list endpoint
  try { $invoices = Invoke-RestMethod -Uri "$Url/api/v1/invoices" -Method GET -Headers $headers -UseBasicParsing }
  catch { Write-Host "No invoices list endpoint found, trying direct IDs..." -ForegroundColor Yellow; $invoices = @() }
}

# 4. Get an invoice ID - try multiple approaches
$invoiceId = $null
if ($invoices -and $invoices.Length -gt 0) { $invoiceId = $invoices[0].id }
if (-not $invoiceId) {
  # Try querying the sim_system invoice table directly
  try {
    $rows = Invoke-RestMethod -Uri "$Url/api/v1/admin/query" -Method POST -Headers $headers -ContentType "application/json" -Body '{"sql":"SELECT id FROM sim_system.invoice WHERE status != ''DELETED'' ORDER BY created_at DESC LIMIT 1"}' -UseBasicParsing
    if ($rows -and $rows[0]) { $invoiceId = $rows[0].id }
  } catch {}
}

if (-not $invoiceId) {
  Write-Host "[ERROR] No invoices found in database. Seed data first." -ForegroundColor Red
  Write-Host "  Run: cd backend && node populate_october.cjs" -ForegroundColor Yellow
  exit 1
}

Write-Host "  Invoice ID: $invoiceId" -ForegroundColor Green

# 5. Generate PDF
$outDir = "$env:TEMP\meter-invoices"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$outFile = "$outDir\invoice-$invoiceId.pdf"

Write-Host "[4] Generating PDF -> $outFile" -ForegroundColor Yellow
try {
  $pdf = Invoke-WebRequest -Uri "$Url/api/v1/invoices/$invoiceId/pdf" -Method GET -Headers $headers -UseBasicParsing
  [System.IO.File]::WriteAllBytes($outFile, $pdf.Content)
  Write-Host "  PDF saved: $outFile" -ForegroundColor Green
  Write-Host "  Size: $($pdf.Content.Length) bytes" -ForegroundColor Green
  
  # Open in default PDF viewer
  Write-Host "[5] Opening PDF..." -ForegroundColor Yellow
  Start-Process $outFile
} catch {
  Write-Host "PDF generation error: $_" -ForegroundColor Red
  # Try to get more detail
  try {
    $err = Invoke-WebRequest -Uri "$Url/api/v1/invoices/$invoiceId/pdf" -Method GET -Headers $headers -UseBasicParsing -TimeoutSec 30
    Write-Host "  Status: $($err.StatusCode)" -ForegroundColor Yellow
  } catch { Write-Host "  $($_.Exception.Message)" -ForegroundColor Red }
}
