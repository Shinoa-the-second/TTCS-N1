"""
Router nhóm Auth: register, login, logout, refresh, change-password.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import RefreshToken, User
from ..schemas import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    MessageResponse,
    RefreshRequest,
    RefreshResponse,
    RegisterRequest,
    RegisterResponse,
    UserPublic,
)
from ..security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Check email trùng
    existed = db.query(User).filter(User.email == body.email.lower()).first()
    if existed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email đã được sử dụng",
        )

    user = User(
        email=body.email.lower(),
        full_name=body.full_name.strip(),
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return RegisterResponse(
        message="Đăng ký thành công",
        user=UserPublic.model_validate(user),
    )


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()

    # Trả 401 chung cho cả 2 case (user không tồn tại / sai password)
    # để tránh lộ thông tin email đã đăng ký.
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản đã bị vô hiệu hóa",
        )

    access_token, expires_in = create_access_token(user.id, user.email)
    refresh_token, expires_at = create_refresh_token(user.id, body.remember_me)

    # Lưu hash của refresh token vào DB
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_refresh_token(refresh_token),
            expires_at=expires_at,
        )
    )
    db.commit()

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        user=UserPublic.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(
    body: LogoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Revoke refresh token này (nếu thuộc user hiện tại)
    th = hash_refresh_token(body.refresh_token)
    (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == th,
            RefreshToken.user_id == current_user.id,
        )
        .update({"is_revoked": True})
    )
    db.commit()
    return MessageResponse(message="Đăng xuất thành công")


@router.post("/refresh", response_model=RefreshResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token không hợp lệ",
        )

    # Check tồn tại trong DB và chưa revoke
    th = hash_refresh_token(body.refresh_token)
    record = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == th, RefreshToken.is_revoked.is_(False))
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token đã bị thu hồi hoặc không tồn tại",
        )

    # Check expiry thủ công (đề phòng lệch giờ server)
    expires_at = record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token đã hết hạn",
        )

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User không hợp lệ",
        )

    access_token, expires_in = create_access_token(user.id, user.email)
    return RefreshResponse(access_token=access_token, expires_in=expires_in)


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mật khẩu hiện tại không đúng",
        )

    current_user.password_hash = hash_password(body.new_password)

    # Invalidate tất cả refresh tokens của user (đăng nhập lại trên mọi thiết bị)
    (
        db.query(RefreshToken)
        .filter(RefreshToken.user_id == current_user.id)
        .update({"is_revoked": True})
    )
    db.commit()
    return MessageResponse(message="Đổi mật khẩu thành công")
