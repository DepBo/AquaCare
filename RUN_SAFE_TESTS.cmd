@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\testing\run-safe-tests.ps1"
echo.
echo Press any key to close this test window.
pause >nul
