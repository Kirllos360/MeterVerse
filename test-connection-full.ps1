Write-Host "=== CONNECTION SETTINGS — FULL TEST ===" -ForegroundColor Cyan

# Auth
$loginFile = "$env:TEMP\login_req.json"
$r = curl.exe -s -X POST "http://localhost:3002/api/auth/dev-login" -H "Content-Type: application/json" "-d@$loginFile"
$token = $r | python -c "import sys,json; print(json.load(sys.stdin)['accessToken'])"

Write-Host "`n--- 1. List existing connections ---" -ForegroundColor Yellow
$list = curl.exe -s "http://localhost:3002/api/database-connections" -H "Authorization: Bearer $token"
Write-Output $list
Write-Host ""

Write-Host "--- 2. Add a new test connection ---" -ForegroundColor Yellow
$body = '{"name":"Test Alpha DB","type":"postgresql","host":"192.168.1.100","port":5432,"database":"test_db","username":"test_user","password":"test_pass_123","areaId":"Test Area","projectId":"Test Project"}'
Set-Content "$env:TEMP\tc1.json" $body
$add = curl.exe -s -X POST "http://localhost:3002/api/database-connections" -H "Authorization: Bearer $token" -H "Content-Type: application/json" "-d@$env:TEMP\tc1.json"
Write-Output $add
Write-Host ""

Write-Host "--- 3. Add a second connection under same area ---" -ForegroundColor Yellow
$body2 = '{"name":"Test Beta DB","type":"mssql","host":"192.168.1.200","port":1433,"database":"analytics_db","username":"sa","password":"Str0ng!Pass","areaId":"Test Area","projectId":"Test Project"}'
Set-Content "$env:TEMP\tc2.json" $body2
$add2 = curl.exe -s -X POST "http://localhost:3002/api/database-connections" -H "Authorization: Bearer $token" -H "Content-Type: application/json" "-d@$env:TEMP\tc2.json"
Write-Output $add2
Write-Host ""

Write-Host "--- 4. List — verify 2 connections under Test Area ---" -ForegroundColor Yellow
$list2 = curl.exe -s "http://localhost:3002/api/database-connections" -H "Authorization: Bearer $token"
$list2 | python -c "import sys,json; d=json.load(sys.stdin); cs=d['connections']; print(f'Total: {len(cs)} connections'); [print(f'  [{c[\"areaId\"] or \"?\"}] {c[\"name\"]} ({c[\"type\"]} — {c[\"host\"]}:{c[\"port\"]})') for c in cs]"

Write-Host "`n--- 5. Test the local PostgreSQL (should succeed) ---" -ForegroundColor Yellow
$testBody = '{"name":"Local Live","type":"postgresql","host":"localhost","port":5432,"database":"meter_pulse","username":"meter_pulse","password":"meter_pulse_dev","areaId":""}'
Set-Content "$env:TEMP\tct.json" $testBody
$testR = curl.exe -s -X POST "http://localhost:3002/api/database-connections/test" -H "Authorization: Bearer $token" -H "Content-Type: application/json" "-d@$env:TEMP\tct.json"
Write-Output $testR
Write-Host ""

Write-Host "--- 6. Test a non-existent host (should fail gracefully) ---" -ForegroundColor Yellow
$failBody = '{"name":"Fake DB","type":"postgresql","host":"10.99.99.99","port":5432,"database":"ghost","username":"nobody","password":"wrong","areaId":""}'
Set-Content "$env:TEMP\tcf.json" $failBody
$failR = curl.exe -s -X POST "http://localhost:3002/api/database-connections/test" -H "Authorization: Bearer $token" -H "Content-Type: application/json" "-d@$env:TEMP\tcf.json"
Write-Output $failR
Write-Host ""

Write-Host "--- 7. Frontend page status ---" -ForegroundColor Yellow
$fe = curl.exe -s -o /dev/null -w "HTTP %{http_code}" "http://localhost:7400/admin/connection-settings"
Write-Output "Frontend: $fe"

Write-Host "`n=== ALL TESTS DONE ===" -ForegroundColor Green
