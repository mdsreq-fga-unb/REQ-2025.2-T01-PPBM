@echo off
echo ========================================
echo   Iniciando Sistema
echo ========================================
echo.

echo [1/2] Iniciando Backend...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Sistema iniciado!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:4321
echo.
echo Pressione qualquer tecla para fechar...
pause >nul

