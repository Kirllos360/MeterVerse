@echo off
title MeterVerse OS - Starting System
echo +---------------------------------------------------------------+
echo                MeterVerse OS Enterprise Platform
echo +---------------------------------------------------------------+
echo.

REM Detect PostgreSQL
set PG_PORT=5433
set PG_DB=meter_pulse

echo [1/6] Checking PostgreSQL...
pg_isready -h localhost -p %PG_PORT% >nul 2>&1
if %errorlevel% equ 0 (
    echo   ? PostgreSQL is running on port %PG_PORT%
) else (
    echo   ? PostgreSQL not found on port %PG_PORT%
    echo   ??  Please start PostgreSQL service manually
    echo   PostgreSQL 16 is installed at C:\Program Files\PostgreSQL\16\
    echo   Start it via: net start postgresql
    pause
    exit /b 1
)

echo [2/6] Running database setup...
cd /d "%~dp0backend"
set DATABASE_URL=postgresql://meter_pulse:meter_pulse_dev@localhost:%PG_PORT%/%PG_DB%?schema=public
call npx prisma generate >nul 2>&1
if %errorlevel% equ 0 ( echo   ? Prisma client generated ) else ( echo   ??  Prisma generate issue )
call npx prisma db push --accept-data-loss >nul 2>&1
if %errorlevel% equ 0 ( echo   ? Database schema synchronized ) else ( echo   ??  Schema sync issue )

echo [3/6] Seeding data...
cd /d "%~dp0backend"
set DATABASE_URL=postgresql://meter_pulse:meter_pulse_dev@localhost:%PG_PORT%/%PG_DB%?schema=public
node scripts/seed.js >nul 2>&1
echo   ? Seed data loaded

echo [4/6] Starting Admin Backend (3131)...
cd /d "%~dp0backend"
set DATABASE_URL=postgresql://meter_pulse:meter_pulse_dev@localhost:%PG_PORT%/%PG_DB%?schema=public
set JWT_SECRET=mv-jwt-secret-change-in-production-2026
set PORT=3131
set CORS_ORIGIN=http://localhost:3030,http://localhost:3535
start "MeterVerse-AdminAPI" cmd /c "node src/server.js"
echo   ? Admin API starting on port 3131

echo [5/6] Starting Admin Frontend (3535)...
cd /d "%~dp0Frontend"
set NEXT_PUBLIC_API_URL=http://localhost:3131
start "MeterVerse-AdminConsole" cmd /c "call node_modules\.bin\next.cmd dev -p 3535"
echo   ? Admin Console starting on port 3535

echo.
echo +---------------------------------------------------------------+
echo   MeterVerse OS starting... Please wait 30-60 seconds
echo   Admin Console : http://localhost:3535   (Admin / Red theme)
echo   Admin API     : http://localhost:3131/api/health
echo   Portal API    : http://localhost:3003/api/health  (PORTAL_MODE=1)
echo   Login         : admin@meterverse.com / Admin@123
echo.
echo   Customer Portal (:3030) — run:  npm run portal:frontend
echo   Portal Backend (:3003)   — run:  npm run portal:backend
echo +---------------------------------------------------------------+
echo.
pause
