"""
Khởi tạo SQLAlchemy engine + session factory.
Hỗ trợ MySQL (production), PostgreSQL, và SQLite (fallback dev).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import settings


def _build_engine():
    url = settings.database_url

    # SQLite cần flag đặc biệt cho FastAPI multi-thread
    if url.startswith("sqlite"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )

    # MySQL / MariaDB / PostgreSQL — connection pool optimal
    return create_engine(
        url,
        pool_size=10,             # Số connection tối đa giữ trong pool
        max_overflow=20,          # Cho phép tạo thêm khi pool đầy
        pool_pre_ping=True,       # Tự ping check connection còn sống không
        pool_recycle=3600,        # Recycle connection sau 1h (tránh timeout MySQL)
        echo=False,               # Đặt True để xem SQL query (debug)
    )


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency inject session vào FastAPI route handler."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
