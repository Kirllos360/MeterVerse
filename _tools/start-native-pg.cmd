@echo off
:: P13.5 - Native PostgreSQL launcher (WMI-detached, session-independent)
:: Starts PG16 :5433 via WMI (survives any shell/session).
powershell -NoProfile -Command "Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = 'cmd.exe /c cd /d \"C:\Program Files\PostgreSQL\16\bin\" & postgres.exe -D \"C:\Program Files\PostgreSQL\16\data\" -p 5433' }"
echo [PG] launch attempted
