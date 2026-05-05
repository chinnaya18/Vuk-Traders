@echo off
REM Vuk Traders - First Time Setup Script
REM This script initializes Python dependencies

echo.
echo ============================================================
echo   Vuk Traders GST Invoice System - First Time Setup
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH!
    echo.
    echo Please install Python 3.10 or later from: https://www.python.org/downloads/
    echo.
    echo IMPORTANT: During installation, check the box:
    echo   "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo [OK] Python is installed
python --version

REM Navigate to backend directory
cd /d "%~dp0backend"
if errorlevel 1 (
    echo ERROR: Could not find backend directory
    pause
    exit /b 1
)

echo.
echo Installing Python dependencies...
echo This may take 2-3 minutes on first run.
echo.

REM Install dependencies
python -m pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo WARNING: Some dependencies failed to install
    echo The application may still work, but some features might not work.
    echo.
) else (
    echo.
    echo [OK] All dependencies installed successfully!
    echo.
)

REM Initialize database
echo Initializing database...
python setup.py

if errorlevel 1 (
    echo WARNING: Database initialization had issues
    echo The app will try to initialize on first run.
)

echo.
echo ============================================================
echo Setup complete! You can now run the application.
echo ============================================================
echo.
pause
