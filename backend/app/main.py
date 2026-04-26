"""
Entry point của Backend.
Chạy bằng: uvicorn app.main:app --reload --port 8001
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from .config import settings
from .database import engine
from .routers import auth, predictions, users


app = FastAPI(
    title="Diabetes System — Backend API",
    description=(
        "Backend xử lý Auth, User profile, Prediction history.\n\n"
        "**Lưu ý**: Backend KHÔNG gọi AI model. Frontend gọi thẳng AI Service "
        "rồi gửi kết quả về Backend lưu lịch sử."
    ),
    version="2.0.0",
)


# ============================================================
# CORS — cho phép Frontend (Vite dev server port 5173) gọi
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Validation error handler — format dễ dùng cho frontend
# ============================================================
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = ".".join(str(x) for x in err.get("loc", []) if x != "body")
        errors.append({"field": loc, "message": err.get("msg", "Invalid")})
    return JSONResponse(
        status_code=422,
        content={"detail": "Dữ liệu không hợp lệ", "errors": errors},
    )


# ============================================================
# Startup: kiểm tra kết nối DB
# ============================================================
@app.on_event("startup")
async def startup_check_db():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection OK")
    except SQLAlchemyError as e:
        print(f"✗ Database connection FAILED: {e}")
        print("  Hãy chạy database/schema.sql để tạo bảng trước.")


# ============================================================
# Health & info endpoints
# ============================================================
@app.get("/health", tags=["Health"])
def health_check():
    """Liveness check + verify DB connectivity."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    return {
        "status": "ok" if db_ok else "degraded",
        "service": "diabetes-backend",
        "database": "connected" if db_ok else "disconnected",
    }


# ============================================================
# Routers
# ============================================================
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(predictions.router)
