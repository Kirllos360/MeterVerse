@echo off
:: MeterVerse Admin FE launcher (:3535) - session-independent scheduled task
cd /d D:\meter\Frontend
set PORT=3535
start "MeterVerse-AdminFE" /b "C:\Program Files\nodejs\node.exe" node_modules\next\dist\bin\next start -p 3535
