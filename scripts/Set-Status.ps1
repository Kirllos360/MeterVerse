# Set-Status.ps1 — Standardized Planning OS status updater
# Usage: .\scripts\Set-Status.ps1 -Path <file> -Status <PLANNING|IN_PROGRESS|COMPLETE>
param(
    [Parameter(Mandatory=True)]
    [string],
    [Parameter(Mandatory=True)]
    [string]
)

$content = Get-Content $Path -Raw

# Detect current status
$oldStatus = $null
if ($content -match 'status:\s*"(?<s>[^"]+)"') { $oldStatus = $matches["s"] }
elseif ($content -match 'status:\s*(?<s>\S+)') { $oldStatus = $matches["s"] }

# Replace both quoted and unquoted
$content = $content -replace 'status:\s*"[^"]*"', "status: "$Status""
$content = $content -replace "status:\s*$oldStatus", "status: $Status"
Set-Content -Path $Path -Value $content

# Verify
$actual = $null
$verify = Get-Content $Path -Raw
if ($verify -match 'status:\s*"(?<s>[^"]+)"') { $actual = $matches["s"] }
elseif ($verify -match 'status:\s*(?<s>\S+)') { $actual = $matches["s"] }

if ($actual -eq $Status) {
    Write-Host "[OK] $Path ? $actual" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[FAIL] $Path ? expected '', got ''" -ForegroundColor Red
    exit 1
}
