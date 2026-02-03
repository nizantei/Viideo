@echo off
echo Stopping all VIIDEO dev servers...
echo.

REM Kill all node processes running vite
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *vite*" 2>nul
if %errorlevel% equ 0 (
    echo Dev servers stopped successfully!
) else (
    REM Try a more aggressive approach - kill all node processes
    echo No vite processes found, trying to kill all node processes...
    taskkill /F /IM node.exe 2>nul
    if %errorlevel% equ 0 (
        echo All node processes stopped!
    ) else (
        echo No dev servers were running.
    )
)

echo.
pause
