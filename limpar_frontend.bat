@echo off
echo Limpando frontend...
cd frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo.
echo Reinstalando dependencias...
call npm install
echo.
echo Pronto!
pause


