"""
Router nhóm Prediction History: POST, GET list (filter + phân trang), GET detail, DELETE.
"""
import math
from datetime import date, datetime, time, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Prediction, User
from ..schemas import (
    CreatePredictionRequest,
    CreatePredictionResponse,
    MessageResponse,
    Pagination,
    PredictionItem,
    PredictionListResponse,
)

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


@router.post(
    "",
    response_model=CreatePredictionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_prediction(
    body: CreatePredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = Prediction(
        user_id=current_user.id,
        input_data=body.input_data.model_dump(),
        prediction=body.prediction,
        label=body.label,
        probability=body.probability,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return CreatePredictionResponse(
        id=record.id,
        user_id=record.user_id,
        created_at=record.created_at,
        message="Lưu lịch sử thành công",
    )


@router.get("", response_model=PredictionListResponse)
def list_predictions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    result: str = Query("all", pattern="^(all|diabetic|normal)$"),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Prediction).filter(Prediction.user_id == current_user.id)

    if result == "diabetic":
        q = q.filter(Prediction.prediction == 1)
    elif result == "normal":
        q = q.filter(Prediction.prediction == 0)

    if date_from:
        dt_from = datetime.combine(date_from, time.min, tzinfo=timezone.utc)
        q = q.filter(Prediction.created_at >= dt_from)
    if date_to:
        dt_to = datetime.combine(date_to, time.max, tzinfo=timezone.utc)
        q = q.filter(Prediction.created_at <= dt_to)

    total = q.count()
    items = (
        q.order_by(Prediction.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    data = [
        PredictionItem(
            id=it.id,
            created_at=it.created_at,
            input_data=it.input_data,
            prediction=it.prediction,
            label=it.label,
            probability=float(it.probability),
        )
        for it in items
    ]

    total_pages = max(1, math.ceil(total / limit)) if total else 0
    return PredictionListResponse(
        data=data,
        pagination=Pagination(
            page=page, limit=limit, total=total, total_pages=total_pages
        ),
    )


@router.get("/{pred_id}", response_model=PredictionItem)
def get_prediction(
    pred_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = (
        db.query(Prediction)
        .filter(Prediction.id == pred_id, Prediction.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bản ghi dự đoán",
        )
    return PredictionItem(
        id=record.id,
        created_at=record.created_at,
        input_data=record.input_data,
        prediction=record.prediction,
        label=record.label,
        probability=float(record.probability),
    )


@router.delete("/{pred_id}", response_model=MessageResponse)
def delete_prediction(
    pred_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = (
        db.query(Prediction)
        .filter(Prediction.id == pred_id, Prediction.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bản ghi dự đoán",
        )
    db.delete(record)
    db.commit()
    return MessageResponse(message="Xóa thành công")
