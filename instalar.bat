@echo off
echo ========================================
echo   Instalando Dependencias
echo ========================================
echo.

echo [1/2] Instalando dependencias do Backend...
cd backend
call npm install
cd ..

echo.
echo [2/2] Instalando dependencias do Frontend...
cd frontend
call npm install
cd ..

echo.
echo ========================================
echo   Instalacao concluida!
echo ========================================
echo.
echo Execute 'iniciar_tudo.bat' para iniciar o sistema
echo.
pause

