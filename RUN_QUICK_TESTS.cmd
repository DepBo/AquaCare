@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\testing\run-quick-tests.ps1"
exit /b %ERRORLEVEL%
