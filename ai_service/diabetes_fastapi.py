"""
AI Service — Diabetes Prediction
Endpoint: POST /predict — nhận 8 chỉ số, trả về kết quả từ RandomForest model
"""
import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load model pipeline (SimpleImputer + RandomForest)
model = joblib.load("diabetes_model.pkl")

app = FastAPI(
    title="Diabetes Prediction AI Service",
    description="Microservice ML cho hệ thống Diabetes Prediction",
    version="1.0.0",
)

# CORS — cho phép Frontend (Vite port 5173) gọi
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8001",
        "null",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DiabetesInput(BaseModel):
    Pregnancies: int = Field(..., ge=0, le=20)
    Glucose: float = Field(..., ge=1, le=300)
    BloodPressure: float = Field(..., ge=1, le=200)
    SkinThickness: float = Field(..., ge=0, le=100)
    Insulin: float = Field(..., ge=0, le=1000)
    BMI: float = Field(..., ge=0.1, le=100)
    DiabetesPedigreeFunction: float = Field(..., ge=0.0, le=3.0)
    Age: int = Field(..., ge=21, le=120)


@app.get("/health")
def health():
    return {"status": "ok", "service": "diabetes-ai"}


@app.post("/predict")
def predict(payload: DiabetesInput):
    df = pd.DataFrame([payload.model_dump()])
    pred = int(model.predict(df)[0])
    proba = float(model.predict_proba(df)[0][1])

    if proba >= 0.8:
        risk_level = "Cao"
    elif proba >= 0.5:
        risk_level = "Trung bình"
    else:
        risk_level = "Thấp"

    diagnosis = "Có nguy cơ tiểu đường" if pred == 1 else "Không có nguy cơ tiểu đường"

    if pred == 1:
        label = "Nguy cơ mắc tiểu đường cao. Khuyến nghị đi khám bác sĩ."
    else:
        label = "Hiện tại không có dấu hiệu tiểu đường. Duy trì lối sống lành mạnh."

    return {
        "prediction": pred,
        "diagnosis": diagnosis,
        "risk_level": risk_level,
        "probability": round(proba, 4),
        "label": label,
    }
