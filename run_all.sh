#!/usr/bin/env bash
# Chạy cả 3 service đồng thời. Bấm Ctrl+C để dừng.

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "⏹  Đang dừng các services..."
  kill $AI_PID $BE_PID $FE_PID 2>/dev/null || true
  wait 2>/dev/null || true
  echo "✓ Đã dừng"
}
trap cleanup SIGINT SIGTERM EXIT

echo "🚀 Khởi động AI Service (port 8000)..."
cd "$ROOT/ai_service"
uvicorn diabetes_fastapi:app --port 8000 > /tmp/diabetes_ai.log 2>&1 &
AI_PID=$!

echo "🚀 Khởi động Backend (port 8001)..."
cd "$ROOT/backend"
uvicorn app.main:app --port 8001 > /tmp/diabetes_backend.log 2>&1 &
BE_PID=$!

echo "🚀 Khởi động Frontend (port 5173)..."
cd "$ROOT/frontend"
npm run dev > /tmp/diabetes_frontend.log 2>&1 &
FE_PID=$!

sleep 5
echo ""
echo "════════════════════════════════════════════════════"
echo "  ✓ AI Service:  http://localhost:8000/docs"
echo "  ✓ Backend:     http://localhost:8001/docs"
echo "  ✓ Frontend:    http://localhost:5173"
echo "════════════════════════════════════════════════════"
echo ""
echo "Logs: /tmp/diabetes_*.log"
echo "Bấm Ctrl+C để dừng tất cả."

wait
