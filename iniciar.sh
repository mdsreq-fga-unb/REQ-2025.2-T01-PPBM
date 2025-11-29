#!/bin/bash

echo "========================================"
echo "  Iniciando Sistema de Cadastro"
echo "========================================"
echo ""

echo "[1/2] Iniciando Backend..."
cd backend && npm run dev &

sleep 3

echo "[2/2] Iniciando Frontend (Astro)..."
cd ../frontend && npm run dev &

echo ""
echo "========================================"
echo "  Sistema iniciado com sucesso!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:4321"
echo ""
echo "Pressione Ctrl+C para parar todos os serviços"

wait

