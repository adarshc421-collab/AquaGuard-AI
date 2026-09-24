@echo off
title AquaGuard AI - Backend Server (FastAPI)
echo ===================================================
echo   AquaGuard AI - Underwater Debris Detection Backend
echo ===================================================
echo Starting FastAPI server at http://127.0.0.1:8000 ...
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
