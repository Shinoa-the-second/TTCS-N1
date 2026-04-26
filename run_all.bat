@echo off
REM Chay 3 service tren Windows. Moi service mo 1 cua so terminal rieng.
REM Dong cua so de dung tung service.

cd /d "%~dp0"

echo Khoi dong AI Service (port 8000)...
start "AI Service - port 8000" cmd /k "cd ai_service && uvicorn diabetes_fastapi:app --port 8000"

timeout /t 3 /nobreak > nul

echo Khoi dong Backend (port 8001)...
start "Backend - port 8001" cmd /k "cd backend && uvicorn app.main:app --port 8001"

timeout /t 3 /nobreak > nul

echo Khoi dong Frontend (port 5173)...
start "Frontend - port 5173" cmd /k "cd frontend && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo ====================================================
echo  AI Service:  http://localhost:8000/docs
echo  Backend:     http://localhost:8001/docs
echo  Frontend:    http://localhost:5173
echo ====================================================
echo.
echo Vite se tu mo trinh duyet voi http://localhost:5173
pause
