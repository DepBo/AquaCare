@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\testing\run-safe-tests.ps1" -Ui
exit /b %ERRORLEVEL%
