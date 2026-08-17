# P13.4 - Native Admin Backend launcher (env + detached, survives session)
# Pattern proven: Start-Process cmd /c "set VAR=x & node src/server.js" survives
# the tool session (same as the node services that persist on :3535/:19072).
$inner = 'set JWT_SECRET=dev_secret_meter_pulse_2026& set DATABASE_URL=postgresql://postgres:postgres@localhost:5433/meter_pulse& set PORT=3131& set CORS_ORIGIN=http://localhost:3535& cd /d D:\meter\backend& node src/server.js'
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $inner -WindowStyle Hidden -PassThru | Out-Null
Start-Sleep -Seconds 3
Write-Output "Admin BE launch attempted via cmd-wrapper"
