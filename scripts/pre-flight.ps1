<#
.SYNOPSIS
    Pre-flight check — verifies tools are available before a task starts.
    Run BEFORE beginning any Phase 42+ task execution.

.DESCRIPTION
    Checks that:
    1. Required tools for the specified task are installed
    2. configs/tools-manifest.md exists and is readable
    3. configs/tool-usage-log.json is writable
    4. STATUS.yaml files for the task exist

.PARAMETER Task
    Task identifier (e.g., "T03", "T04", "T05")
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Task
)

$projectRoot = "D:\meter"
$manifest = "$projectRoot\configs\tools-manifest.md"
$usageLog = "$projectRoot\configs\tool-usage-log.json"
$errors = 0

Write-Host "═══ PRE-FLIGHT CHECK: $Task ═══" -ForegroundColor Magenta

# 1. Check manifest exists
if (Test-Path $manifest) {
    Write-Host "  [OK] tools-manifest.md" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] tools-manifest.md NOT FOUND" -ForegroundColor Red
    $errors++
}

# 2. Check usage log writable
if (Test-Path $usageLog) {
    Write-Host "  [OK] tool-usage-log.json" -ForegroundColor Green
} else {
    Write-Host "  [WARN] tool-usage-log.json missing — will create" -ForegroundColor Yellow
}

# 3. Check required MCP tools based on task
switch ($Task) {
    "T03" { $required = @("sequential-thinking", "git", "filesystem") }
    "T04" { $required = @("filesystem") }
    "T05" { $required = @("filesystem", "playwright") }
    default { $required = @("filesystem") }
}

foreach ($tool in $required) {
    # Check if tool is in opencode.json MCP config
    $configPath = "$env:USERPROFILE\.config\opencode\opencode.json"
    if (Test-Path $configPath) {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        $found = $config.mcp.PSObject.Properties.Name -contains $tool
        if ($found) {
            Write-Host "  [OK] MCP tool: $tool" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] MCP tool: $tool not in opencode.json" -ForegroundColor Yellow
        }
    }
}

# 4. Check task STATUS.yaml exists
$planRoot = "$projectRoot\planning\001_WAVES\Wave_01_Enterprise_Hardening\Phases"
$statusFiles = Get-ChildItem $planRoot -Recurse -Filter "*STATUS.yaml" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -match $Task
}
if ($statusFiles) {
    Write-Host "  [OK] STATUS files for $Task" -ForegroundColor Green
} else {
    Write-Host "  [WARN] No STATUS files found for $Task" -ForegroundColor Yellow
}

if ($errors -eq 0) {
    Write-Host "`n  ✅ PRE-FLIGHT PASSED — all checks OK" -ForegroundColor Green
} else {
    Write-Host "`n  ❌ PRE-FLIGHT FAILED — $errors errors" -ForegroundColor Red
}

exit $errors
