"""
Router nhóm User: GET /me, PATCH /me.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Prediction, User
from ..schemas import PredictionStats, UpdateUserRequest, UserMeResponse

router = APIRouter(prefix="/api/users", tags=["Users"])


def _build_stats(db: Session, user_id: str) -> PredictionStats:
    """Đếm số lần dự đoán theo từng nhãn của user hiện tại."""
    rows = (
        db.query(Prediction.prediction, func.count(Prediction.id))
        .filter(Prediction.user_id == user_id)
        .group_by(Prediction.prediction)
        .all()
    )
    diabetic = 0
    normal = 0
    for pred_val, cnt in rows:
        if pred_val == 1:
            diabetic = cnt
        elif pred_val == 0:
            normal = cnt
    return PredictionStats(total=diabetic + normal, diabetic=diabetic, normal=normal)


@router.get("/me", response_model=UserMeResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stats = _build_stats(db, current_user.id)
    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        date_of_birth=current_user.date_of_birth,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        prediction_stats=stats,
    )


@router.patch("/me", response_model=UserMeResponse)
def update_me(
    body: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Chỉ cập nhật field được gửi lên
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(current_user, k, v)
    db.commit()
    db.refresh(current_user)

    stats = _build_stats(db, current_user.id)
    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        date_of_birth=current_user.date_of_birth,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        prediction_stats=stats,
    )
