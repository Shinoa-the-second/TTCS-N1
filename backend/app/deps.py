"""
Dependency cho các endpoint yêu cầu authentication.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .security import decode_token


# tokenUrl chỉ để Swagger UI biết dùng endpoint nào cho login,
# không ảnh hưởng logic — chúng ta dùng JSON body chứ không form OAuth2 chuẩn.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exc

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exc

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise credentials_exc

    return user
