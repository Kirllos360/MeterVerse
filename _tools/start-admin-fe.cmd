@echo off
:: P13.5 - Admin Frontend launcher (WMI-detached, session-independent)
:: Starts Next.js :3535 (already-running instances are left alone).
powershell -NoProfile -Command "$c=Get-NetTCPConnection -State Listen -LocalPort 3535 -ErrorAction SilentlyContinue; if($c){'already-up';exit}" | findstr "already-up" >nul
if not errorlevel 1 (
  echo [FE] :3535 already running
  exit /b 0
)
powershell -NoProfile -Command "Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = 'cmd.exe /c cd /d D:\meter\Frontend & set NEXT_PUBLIC_API_URL=http://localhost:3131 & call node_modules\.bin\next.cmd start -p 3535' }"
echo [FE] launch attempted
