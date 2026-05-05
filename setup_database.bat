@echo off
REM Vuk Traders Database Setup Script
REM This script helps set up PostgreSQL database for Vuk Traders

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Vuk Traders Database Setup Wizard
echo ========================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo Make sure to add PostgreSQL to your system PATH during installation
    pause
    exit /b 1
)

echo PostgreSQL found!
echo.
echo This script will:
echo 1. Create a PostgreSQL database named 'vuk_traders'
echo 2. Create a user 'vuk_trader' with secure password
echo 3. Grant all privileges to the user
echo.

REM Get PostgreSQL superuser password
set /p PG_PASSWORD="Enter PostgreSQL superuser (postgres) password: "

REM Generate a secure password for vuk_trader user
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set APP_PASSWORD=VukTraders_%mydate%_%mytime%

echo.
echo Generated database user password: %APP_PASSWORD%
echo Please save this password somewhere safe!
echo.

REM Create database and user
echo Creating database and user...
(
    echo CREATE DATABASE vuk_traders;
    echo CREATE USER vuk_trader WITH PASSWORD '%APP_PASSWORD%';
    echo GRANT ALL PRIVILEGES ON DATABASE vuk_traders TO vuk_trader;
    echo \q
) | psql -U postgres -h localhost

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database. Please check your PostgreSQL password.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Database Setup Complete!
echo ========================================
echo.
echo Database Name: vuk_traders
echo Database User: vuk_trader
echo Database Password: %APP_PASSWORD%
echo PostgreSQL Host: localhost
echo PostgreSQL Port: 5432
echo.
echo Next steps:
echo 1. Update the .env file in the app directory with:
echo    DATABASE_URL=postgresql+psycopg://vuk_trader:%APP_PASSWORD%@localhost:5432/vuk_traders
echo 2. Restart the Vuk Traders application
echo.
pause
