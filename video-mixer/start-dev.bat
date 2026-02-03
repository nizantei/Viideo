@echo off
echo Starting VIIDEO dev server...
echo.

REM Open browser after a short delay
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5174"

REM Start the dev server (this will block until Ctrl+C)
npm run dev

pause
