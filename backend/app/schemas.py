"""
Pydantic schemas: định nghĩa cấu trúc request/response cho từng endpoint.
Validation phía server khớp với "Validation phía Client" trong docx.
"""
import re
from datetime import datetime, date
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


# ============================================================
# Password validation dùng chung
# ============================================================
PASSWORD_PATTERN = re.compile(
    r"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]).{8,}$"
)


def validate_strong_password(v: str) -> str:
    if not PASSWORD_PATTERN.match(v):
        raise ValueError(
            "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt"
        )
    return v


# ============================================================
# Auth schemas
# ============================================================
class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def _pwd(cls, v: str) -> str:
        return validate_strong_password(v)


class UserPublic(BaseModel):
    """Thông tin user trả ra ngoài (KHÔNG bao giờ chứa password_hash)."""
    id: str
    email: str
    full_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RegisterResponse(BaseModel):
    message: str
    user: UserPublic


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    remember_me: bool = False


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int  # seconds
    user: UserPublic


class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str
    expires_in: int


class LogoutRequest(BaseModel):
    refresh_token: str


class MessageResponse(BaseModel):
    message: str


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=1)
    new_password: str
    confirm_new_password: str

    @field_validator("new_password")
    @classmethod
    def _new_pwd(cls, v: str) -> str:
        return validate_strong_password(v)

    @field_validator("confirm_new_password")
    @classmethod
    def _match(cls, v: str, info):
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Mật khẩu xác nhận không khớp")
        return v


# ============================================================
# User schemas
# ============================================================
class PredictionStats(BaseModel):
    total: int
    diabetic: int
    normal: int


class UserMeResponse(BaseModel):
    id: str
    email: str
    full_name: str
    date_of_birth: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    prediction_stats: PredictionStats

    model_config = ConfigDict(from_attributes=True)


class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    date_of_birth: Optional[date] = None


# ============================================================
# Prediction schemas — khớp 8 feature của bộ dataset
# ============================================================
class DiabetesInput(BaseModel):
    Pregnancies: int = Field(..., ge=0, le=20)
    Glucose: float = Field(..., ge=1, le=300)
    BloodPressure: float = Field(..., ge=1, le=200)
    SkinThickness: float = Field(..., ge=0, le=100)
    Insulin: float = Field(..., ge=0, le=1000)
    BMI: float = Field(..., ge=0.1, le=100)
    DiabetesPedigreeFunction: float = Field(..., ge=0.0, le=3.0)
    Age: int = Field(..., ge=21, le=120)


class CreatePredictionRequest(BaseModel):
    input_data: DiabetesInput
    prediction: Literal[0, 1]
    label: str = Field(..., max_length=100)
    probability: float = Field(..., ge=0.0, le=1.0)


class CreatePredictionResponse(BaseModel):
    id: str
    user_id: str
    created_at: datetime
    message: str


class PredictionItem(BaseModel):
    id: str
    created_at: datetime
    input_data: dict
    prediction: int
    label: str
    probability: float

    model_config = ConfigDict(from_attributes=True)


class Pagination(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class PredictionListResponse(BaseModel):
    data: List[PredictionItem]
    pagination: Pagination
