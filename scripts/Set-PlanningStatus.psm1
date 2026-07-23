function Set-PlanningStatus {
    param(
        [Parameter(Mandatory = True)]
        [string],
        [Parameter(Mandatory = True)]
        [ValidateSet("PLANNING", "IN_PROGRESS", "COMPLETE", "BLOCKED", "CANCELLED")]
        [string]
    )

    if (-not (Test-Path )) {
        Write-Error "File not found: "
        return False
    }

     = Get-Content  -Raw
     = ""

    # Extract current status
    if ( -match 'status:\s*"(?<s>[^"]+)"') {
         = ["s"]
    } elseif ( -match 'status:\s*(?<s>\S+)') {
         = ["s"]
    }

    # Update both quoted and unquoted variants
     =  -replace 'status:\s*"[^"]*"', "status: """
     =  -replace "status:\s*", "status: "
    Set-Content -Path  -Value 

    # VERIFY
     = ""
     = Get-Content  -Raw
    if ( -match 'status:\s*"(?<s>[^"]+)"') {
         = ["s"]
    } elseif ( -match 'status:\s*(?<s>\S+)') {
         = ["s"]
    }

    if ( -eq ) {
         = .Replace("D:\meter\", "").Replace("D:\meter\planning\", "")
        Write-Host "  [OK]  ? " -ForegroundColor Green
        return True
    } else {
        Write-Host "  [FAIL]  ? expected '', got ''" -ForegroundColor Red
        return False
    }
}

# Export function for reuse
Export-ModuleMember -Function Set-PlanningStatus
