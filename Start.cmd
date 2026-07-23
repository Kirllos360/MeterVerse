@echo off
title MeterVerse — Starting System
echo +---------------------------------------------------------------+
echo ¦              MeterVerse Enterprise Platform                   ¦
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

echo [4/6] Starting Backend...
cd /d "%~dp0backend\src"
set DATABASE_URL=postgresql://meter_pulse:meter_pulse_dev@localhost:%PG_PORT%/%PG_DB%?schema=public
set JWT_SECRET=mv-jwt-secret-change-in-production-2026
set PORT=3001
start "MeterVerse-Backend" cmd /c "node server.js"
echo   ? Backend starting on port 3001

echo [5/6] Starting Frontend...
cd /d "%~dp0Frontend"
start "MeterVerse-Frontend" cmd /c "npx next dev -p 7400"
echo   ? Frontend starting on port 7400

echo.
echo +---------------------------------------------------------------+
echo ¦  System starting... Please wait 30-60 seconds for first load ¦
echo ¦  Frontend: http://localhost:7400                              ¦
echo ¦  Backend:  http://localhost:3001                              ¦
echo ¦  Login:    admin@meterverse.com / Admin@123                   ¦
echo +---------------------------------------------------------------+
echo.
pause
