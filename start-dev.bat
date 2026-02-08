@echo off
echo Starting VIIDEO dev server...
echo.

REM Open browser after a short delay
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

REM Start the dev server (this will block until Ctrl+C)
cd /d "%~dp0video-mixer"
npm run dev

pause
