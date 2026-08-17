@echo off
:: MeterVerse Portal FE launcher (:3030, PORTAL_MODE) - session-independent scheduled task
cd /d D:\meter\Frontend
set PORT=3030
set PORTAL_MODE=1
set NEXT_PUBLIC_PORTAL_MODE=1
start "MeterVerse-PortalFE" /b "C:\Program Files\nodejs\node.exe" node_modules\next\dist\bin\next start -p 3030
