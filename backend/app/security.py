"""
Tiện ích bảo mật: hash password (bcrypt), tạo/verify JWT, hash refresh token (SHA-256).
"""
import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings


# ============================================================
# Password hashing — bcrypt cost 12 theo yêu cầu docx
# ============================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(raw: str) -> str:
    return pwd_context.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    return pwd_context.verify(raw, hashed)


# ============================================================
# JWT tokens
# ============================================================
def create_access_token(user_id: str, email: str) -> tuple[str, int]:
    """Trả về (token, expires_in_seconds)."""
    expire_seconds = settings.access_token_expire_minutes * 60
    expire_at = datetime.now(timezone.utc) + timedelta(seconds=expire_seconds)
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": expire_at,
        "iat": datetime.now(timezone.utc),
    }
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    return token, expire_seconds


def create_refresh_token(user_id: str, remember_me: bool = False) -> tuple[str, datetime]:
    """Trả về (token, expires_at_datetime)."""
    days = (
        settings.refresh_token_expire_days_remember
        if remember_me
        else settings.refresh_token_expire_days
    )
    expire_at = datetime.now(timezone.utc) + timedelta(days=days)
    payload = {
        "sub": user_id,
        "jti": str(uuid.uuid4()),  # unique identifier để invalidate
        "type": "refresh",
        "exp": expire_at,
        "iat": datetime.now(timezone.utc),
    }
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    return token, expire_at


def decode_token(token: str) -> Optional[dict]:
    """Trả về payload nếu hợp lệ, None nếu hết hạn/invalid."""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None


def hash_refresh_token(token: str) -> str:
    """SHA-256 hash — không lưu raw refresh token trong DB."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
