@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\testing\run-safe-tests.ps1" -Core -UsbMobile
exit /b %ERRORLEVEL%
