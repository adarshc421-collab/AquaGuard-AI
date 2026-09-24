@echo off
title AquaGuard AI - Full Stack Launcher
echo ==========================================================
echo   AquaGuard AI - Underwater Marine Debris Detection System
echo   Smart India Hackathon Ready Launcher
echo ==========================================================
echo.
echo Launching Backend (FastAPI on Port 8000)...
start "AquaGuard AI Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo Launching Frontend (React on Port 5173)...
start "AquaGuard AI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo System started!
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:8000
echo Swagger Docs: http://127.0.0.1:8000/docs
echo ==========================================================
