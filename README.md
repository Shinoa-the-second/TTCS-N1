# 🩺 Diabetes Prediction System

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1) 

Web dự đoán nguy cơ tiểu đường, kiến trúc **3 tầng** với stack hiện đại:

- **Frontend**: React 18 + Vite + TypeScript + Tailwind v4 + Redux Toolkit + TanStack Query + Recharts
- **Backend**: FastAPI + SQLAlchemy 2 + JWT + bcrypt
- **Database**: MySQL 8.0+ (hoặc MariaDB 10.5+)
- **AI Service**: FastAPI + scikit-learn (RandomForest)

## 🏗️ Kiến trúc

```
┌───────────────────────────────────────┐
│  Frontend  (React + Vite)             │  http://localhost:5173
│  - 6 trang: Landing, Register, Login, │
│    Predict, History, Profile          │
└──────┬───────────────────┬────────────┘
       │ /predict          │ /api/auth, /users, /predictions
       ↓                   ↓
┌──────────────────┐  ┌──────────────────────┐
│  AI Service      │  │  Backend             │
│  (FastAPI)       │  │  (FastAPI)           │
│  port 8000       │  │  port 8001           │
│                  │  │                      │
│  RandomForest    │  │  Auth + History API  │
└──────────────────┘  └──────────┬───────────┘
                                 ↓
                      ┌──────────────────────┐
                      │  MySQL 8.0+          │
                      │  3 bảng:             │
                      │  - users             │
                      │  - refresh_tokens    │
                      │  - predictions       │
                      └──────────────────────┘
```

> **Lưu ý**: Backend KHÔNG gọi AI model. Frontend gọi thẳng AI Service rồi gửi kết quả về Backend lưu lịch sử.

## 📁 Cấu trúc

```
diabetes_v2/
├── database/                 # 🗄️ MySQL schema
│   ├── schema.sql            #     - DDL 3 bảng + view + sample data
│   └── README.md             #     - Hướng dẫn cài MySQL chi tiết
│
├── backend/                  # ⚙️ FastAPI + SQLAlchemy + JWT
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py       #     MySQL connection pool
│   │   ├── models.py         #     SQLAlchemy models
│   │   ├── schemas.py        #     Pydantic schemas
│   │   ├── security.py       #     bcrypt + JWT
│   │   ├── deps.py
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── users.py
│   │       └── predictions.py
│   ├── requirements.txt      #     fastapi, sqlalchemy, pymysql...
│   ├── .env.example
│   └── README.md
│
├── frontend/                 # 🎨 React + Vite + TypeScript
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/              #     Axios + endpoints
│   │   ├── store/            #     Redux Toolkit (auth + toast)
│   │   ├── hooks/            #     TanStack Query hooks
│   │   ├── components/       #     Navbar, Toast, Modal, Tooltip...
│   │   ├── pages/            #     6 pages
│   │   ├── lib/              #     Constants, utils
│   │   └── types/            #     TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── ai_service/               # 🤖 ML model service
│   ├── diabetes_fastapi.py   #     FastAPI + CORS
│   ├── diabetes_model.pkl    #     RandomForest (đã train)
│   ├── requirements.txt
│   └── README.md
│
├── run_all.sh                # 🐧 Linux/macOS one-liner
├── run_all.bat               # 🪟 Windows one-liner
└── README.md                 # 📖 File này
```

## 🚀 Hướng dẫn chạy (chi tiết)

### Yêu cầu hệ thống

| Phần mềm | Phiên bản | Lý do |
|---|---|---|
| **Python** | 3.10+ | Backend + AI Service |
| **Node.js** | 18+ | Frontend (Vite) |
| **MySQL** | 8.0+ (hoặc MariaDB 10.5+) | Database |

### Bước 1: Cài MySQL & tạo database

Xem chi tiết trong `database/README.md`. Tóm tắt:

```bash
# Linux/macOS
mysql -u root -p < database/schema.sql

# Hoặc dùng MySQL Workbench: File → Open SQL Script → schema.sql → Execute
```

Verify:
```sql
USE diabetes_db;
SHOW TABLES;
-- predictions, refresh_tokens, users, v_user_prediction_stats
```

### Bước 2: Cài thư viện

```bash
# Vào root project
cd diabetes_v2

# Tạo Python venv (khuyến nghị)
python -m venv .venv
source .venv/bin/activate              # Linux/macOS
# .venv\Scripts\activate                 # Windows

# Cài Python packages
pip install -r ai_service/requirements.txt
pip install -r backend/requirements.txt

# Cài Node packages
cd frontend
npm install
cd ..
```

### Bước 3: Cấu hình `.env`

**Backend:**
```bash
cd backend
cp .env.example .env
```

Mở `backend/.env`, sửa 2 dòng:
```env
# 1. Đổi MySQL password
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/diabetes_db

# 2. Sinh SECRET_KEY ngẫu nhiên
SECRET_KEY=...
```

Sinh SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
```

Mặc định đã đúng — không cần sửa.

### Bước 4: Chạy 3 service

**Cách dễ — 1 lệnh:**

```bash
# Linux/macOS
chmod +x run_all.sh && ./run_all.sh

# Windows
run_all.bat
```

**Cách thủ công — 3 terminal riêng:**

| Terminal 1 — AI | Terminal 2 — Backend | Terminal 3 — Frontend |
|---|---|---|
| `cd ai_service` | `cd backend` | `cd frontend` |
| `uvicorn diabetes_fastapi:app --port 8000` | `uvicorn app.main:app --port 8001` | `npm run dev` |

### Bước 5: Mở trình duyệt

→ **http://localhost:5173** (Vite tự mở)

## 🎯 Sử dụng

1. Click **Đăng ký** → tạo tài khoản:
   - Hoặc dùng tài khoản demo có sẵn: `demo@example.com` / `Demo@1234`
2. Click **Đăng nhập** với email/mật khẩu
3. Vào **Dự đoán** → click **"Điền mẫu"** → click **"Dự đoán ngay"**
4. Vào **Lịch sử** → xem bảng + biểu đồ xu hướng
5. Vào **Hồ sơ** → xem stats, đổi info, đổi mật khẩu

## ✨ Tính năng

### Auth & Bảo mật
- ✅ Đăng ký với password validation (8+ ký tự, hoa, số, ký tự đặc biệt)
- ✅ Đăng nhập với JWT (access 1h + refresh 7d/30d nếu remember me)
- ✅ bcrypt cost=12 cho password
- ✅ Refresh token SHA-256 hash trong DB
- ✅ Auto-logout khi token hết hạn (Axios 401 interceptor)
- ✅ Đổi mật khẩu → revoke toàn bộ refresh tokens

### Predict & Lịch sử
- ✅ Form 8 chỉ số y tế với validation client + server
- ✅ Tooltip giải thích cho từng chỉ số (hover/click)
- ✅ Nút "Điền mẫu" cho data demo
- ✅ Card kết quả màu theo risk level (Cao/TB/Thấp)
- ✅ Tự động lưu lịch sử về backend
- ✅ Lịch sử có filter (kết quả, ngày), phân trang, modal chi tiết, xóa
- ✅ **Biểu đồ Recharts xu hướng** Glucose/BMI/Probability theo thời gian
- ✅ **Pie chart** tỷ lệ kết quả trong trang hồ sơ

### UX
- ✅ Toast notifications (success/error/warning/info)
- ✅ Loading spinners + skeleton loading
- ✅ Validation inline (react-hook-form)
- ✅ Responsive mobile
- ✅ Type-safe (TypeScript strict mode)

## 🛠️ Tech Stack chi tiết

### Frontend
| Package | Version | Mục đích |
|---|---|---|
| react + react-dom | 18.3 | UI framework |
| vite | 5.4 | Build tool |
| typescript | 5.6 | Type safety |
| tailwindcss | 4.0-beta | Styling |
| @reduxjs/toolkit | 2.2 | Auth state |
| react-redux | 9.1 | Redux bindings |
| @tanstack/react-query | 5.59 | Server state + cache |
| react-hook-form | 7.53 | Forms |
| react-router-dom | 6.26 | Routing |
| axios | 1.7 | HTTP client |
| lucide-react | 0.452 | Icons |
| recharts | 2.13 | Charts |
| clsx | 2.1 | className utility |

### Backend
| Package | Version | Mục đích |
|---|---|---|
| fastapi | 0.115 | Web framework |
| sqlalchemy | 2.0 | ORM |
| pymysql | 1.1 | MySQL driver |
| cryptography | 43.0 | TLS for pymysql |
| pydantic | 2.9 | Validation |
| python-jose | 3.3 | JWT |
| passlib + bcrypt | — | Password hashing |
| uvicorn | 0.32 | ASGI server |

### AI Service
| Package | Mục đích |
|---|---|
| scikit-learn | RandomForestClassifier |
| pandas | DataFrame |
| joblib | Load model |
| fastapi + uvicorn | API server |

## 📊 ML Model

- **Algorithm**: RandomForestClassifier
- **Hyperparams**: `n_estimators=300, max_depth=5, criterion='entropy', class_weight='balanced'`
- **Pipeline**: SimpleImputer(median) → RandomForest
- **Dataset**: Pima Indians Diabetes (768 samples)
- **8 features**: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age

Risk levels:
- `probability >= 0.80` → "Cao" (đỏ)
- `probability >= 0.50` → "Trung bình" (cam)
- `probability < 0.50`  → "Thấp" (xanh)

## ⚠️ Trước khi deploy production

1. **Đổi `SECRET_KEY`** trong `backend/.env` thành chuỗi random ≥ 32 ký tự
2. **Tạo MySQL user riêng** (không dùng `root`) — xem `database/README.md`
3. **HTTPS bắt buộc** (Let's Encrypt miễn phí)
4. **Build frontend production**: `cd frontend && npm run build` → serve `dist/`
5. **Restrict CORS** trong `backend/app/main.py` chỉ cho phép domain thật
6. **Thêm rate limiting** (slowapi hoặc nginx)
7. **Backup MySQL** định kỳ
8. **Monitor logs** (Sentry, ELK, hoặc CloudWatch)

## 📚 API Documentation

Khi 2 service chạy, mở Swagger UI:
- **AI Service**: http://localhost:8000/docs
- **Backend**: http://localhost:8001/docs

## 🎓 Tài liệu thiết kế

Xem `TaiLieuKyThuat_DiabetesSystem.docx` (gốc):
- Phần 1 — Frontend UI design
- Phần 2 — Backend REST API
- Phần 3 — Database schema (đã được hiện thực hóa trong `database/schema.sql`)
