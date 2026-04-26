# AI Service — Diabetes Prediction Model

Microservice FastAPI chạy mô hình **RandomForest** dự đoán nguy cơ tiểu đường.

## 📦 Cài đặt

```bash
python -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate            # Windows

pip install -r requirements.txt
```

## 🚀 Chạy

```bash
uvicorn diabetes_fastapi:app --reload --port 8000
```

- **API docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health
- **Predict**: `POST http://localhost:8000/predict`

## 🧪 Test API

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Pregnancies": 6,
    "Glucose": 148,
    "BloodPressure": 72,
    "SkinThickness": 35,
    "Insulin": 0,
    "BMI": 33.6,
    "DiabetesPedigreeFunction": 0.627,
    "Age": 50
  }'
```

Response:
```json
{
  "prediction": 1,
  "diagnosis": "Có nguy cơ tiểu đường",
  "risk_level": "Cao",
  "probability": 0.87,
  "label": "Nguy cơ mắc tiểu đường cao. Khuyến nghị đi khám bác sĩ."
}
```

## 🤖 Model info

- **Algorithm**: RandomForestClassifier
- **Hyperparams**: `n_estimators=300, max_depth=5, criterion='entropy', class_weight='balanced'`
- **Pipeline**: `SimpleImputer(median) → RandomForest`
- **Dataset**: Pima Indians Diabetes (768 samples)
- **Features (8)**: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age

## 🎚️ Risk levels

| Probability | Risk Level |
|---|---|
| ≥ 0.80 | Cao |
| ≥ 0.50 | Trung bình |
| < 0.50 | Thấp |
