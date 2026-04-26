"""
SQLAlchemy models cho 3 bảng: users, refresh_tokens, predictions.
Map 1-1 với schema trong Phần 3 của tài liệu kỹ thuật.
"""
import uuid
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey,
    SmallInteger, Numeric, Date, CheckConstraint, JSON, Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), nullable=False,
        server_default=func.now(), onupdate=func.now(),
    )

    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    predictions = relationship(
        "Prediction", back_populates="user", cascade="all, delete-orphan"
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    is_revoked = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", back_populates="refresh_tokens")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    # JSONB trên Postgres, JSON trên SQLite — SQLAlchemy tự chọn
    input_data = Column(JSON, nullable=False)
    prediction = Column(SmallInteger, nullable=False)
    label = Column(String(100), nullable=False)
    probability = Column(Numeric(5, 4), nullable=False)
    created_at = Column(
        DateTime(timezone=True), nullable=False,
        server_default=func.now(), index=True,
    )

    __table_args__ = (
        CheckConstraint("prediction IN (0, 1)", name="chk_prediction_value"),
        CheckConstraint(
            "probability >= 0 AND probability <= 1", name="chk_probability_range"
        ),
        Index("idx_predictions_user_created", "user_id", "created_at"),
        Index("idx_predictions_user_prediction", "user_id", "prediction"),
    )

    user = relationship("User", back_populates="predictions")
