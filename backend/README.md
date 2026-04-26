# Backend — FastAPI + MySQL

Backend xử lý **Auth** (đăng ký/đăng nhập/JWT), **User profile**, và **Prediction history**.

> ⚠️ Backend **KHÔNG** gọi AI model. Frontend gọi thẳng AI Service, sau đó gửi kết quả về Backend để lưu lịch sử.

## 📦 Cài đặt

```bash
# 1. Tạo virtual env (khuyến nghị)
python -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate            # Windows

# 2. Cài thư viện
pip install -r requirements.txt
```

## 🗄️ Tạo MySQL database trước

Xem hướng dẫn chi tiết trong `../database/README.md`. Tóm tắt:

```bash
# Linux/macOS
mysql -u root -p < ../database/schema.sql

# Hoặc dùng MySQL Workbench: File → Open SQL Script → schema.sql → Execute
```

## ⚙️ Cấu hình `.env`

```bash
cp .env.example .env
```

Mở `.env` và sửa **2 thứ quan trọng**:

```env
# 1. Đổi password MySQL theo cấu hình của bạn
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/diabetes_db

# 2. Tạo SECRET_KEY ngẫu nhiên (chạy lệnh dưới để sinh)
SECRET_KEY=...
```

Sinh SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## 🚀 Chạy server

```bash
uvicorn app.main:app --reload --port 8001
```

Truy cập:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc
- **Health check**: http://localhost:8001/health

Khi khởi động backend sẽ tự kiểm tra kết nối DB:
```
✓ Database connection OK
```

Nếu thấy `✗ Database connection FAILED` → kiểm tra lại `.env` và đảm bảo đã chạy `schema.sql`.

## 🗺️ API Endpoints

| Nhóm | Method | Path | Auth |
|---|---|---|---|
| Auth | POST | `/api/auth/register` | ❌ |
| Auth | POST | `/api/auth/login` | ❌ |
| Auth | POST | `/api/auth/logout` | ✅ |
| Auth | POST | `/api/auth/refresh` | ❌ |
| Auth | POST | `/api/auth/change-password` | ✅ |
| Users | GET | `/api/users/me` | ✅ |
| Users | PATCH | `/api/users/me` | ✅ |
| Predictions | POST | `/api/predictions` | ✅ |
| Predictions | GET | `/api/predictions` (filter+phân trang) | ✅ |
| Predictions | GET | `/api/predictions/{id}` | ✅ |
| Predictions | DELETE | `/api/predictions/{id}` | ✅ |

✅ = cần header `Authorization: Bearer {access_token}`

## 🧪 Test nhanh

```bash
# Đăng ký
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test","email":"a@test.com","password":"P@ssw0rd1"}'

# Đăng nhập
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"P@ssw0rd1"}'
```

Hoặc dùng tài khoản demo có sẵn trong `schema.sql`:
- Email: `demo@example.com`
- Password: `Demo@1234`

## 🔒 Security

- **bcrypt cost=12** cho password
- **JWT HS256** — access token 1h, refresh token 7d/30d
- Refresh token **SHA-256 hash** trước khi lưu DB
- Đổi mật khẩu → revoke tất cả refresh token
- CORS đã whitelist Vite dev server (port 5173)
- Connection pool MySQL: 10 + 20 overflow, recycle 1h

## 🐛 Troubleshooting

### `Access denied for user`
→ Sai user/password trong `DATABASE_URL`. Kiểm tra lại `.env`.

### `Unknown database 'diabetes_db'`
→ Chưa chạy `schema.sql`. Chạy lệnh:
```bash
mysql -u root -p < ../database/schema.sql
```

### `Can't connect to MySQL server`
→ MySQL service chưa chạy:
- Windows: vào Services → MySQL → Start
- macOS: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### Lỗi `cryptography` không cài được trên Windows
→ Cài Visual C++ Build Tools, hoặc dùng wheels có sẵn:
```bash
pip install --only-binary :all: cryptography
```
