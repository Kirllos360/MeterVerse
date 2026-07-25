@echo off
REM MeterVerse PostgreSQL Backup Script
REM Usage: pg_backup.cmd [output_dir]
REM Default: backs up to D:\meter\backups\

setlocal enabledelayedexpansion
set OUTDIR=%~1
if "%OUTDIR%"=="" set OUTDIR=D:\meter\backups
if not exist "%OUTDIR%" mkdir "%OUTDIR%"

set TIMESTAMP=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set FILENAME=meter_pulse_%TIMESTAMP%.sql

echo [MeterVerse] Backing up PostgreSQL database...
echo [MeterVerse] Output: %OUTDIR%\%FILENAME%

docker exec meter-postgres-1 pg_dump -U meter_pulse meter_pulse > "%OUTDIR%\%FILENAME%"

if %ERRORLEVEL% equ 0 (
  echo [MeterVerse] ✅ Backup successful: %FILENAME%
  echo [MeterVerse] Size: 
  for %%F in ("%OUTDIR%\%FILENAME%") do echo [MeterVerse]   %%~zF bytes
) else (
  echo [MeterVerse] ❌ Backup failed with error %ERRORLEVEL%
)

REM Keep only last 7 backups
echo [MeterVerse] Cleaning old backups (keeping 7)...
for /f "skip=7" %%F in ('dir "%OUTDIR%\meter_pulse_*.sql" /b /o-d 2^>nul') do (
  del "%OUTDIR%\%%F"
  echo [MeterVerse]   Removed: %%F
)

echo [MeterVerse] Done.
