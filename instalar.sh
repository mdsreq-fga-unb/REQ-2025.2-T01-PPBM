#!/bin/bash

echo "========================================"
echo "  Instalando Dependencias"
echo "========================================"
echo ""

echo "[1/2] Instalando dependencias do Backend..."
cd backend && npm install && cd ..

echo ""
echo "[2/2] Instalando dependencias do Frontend..."
cd frontend && npm install && cd ..

echo ""
echo "========================================"
echo "  Instalacao concluida!"
echo "========================================"
echo ""
echo "Execute './iniciar.sh' para iniciar o sistema"


