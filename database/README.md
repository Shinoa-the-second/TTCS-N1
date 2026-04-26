# 🗄️ Database — MySQL Setup

Schema MySQL cho hệ thống Diabetes Prediction. Tương thích **MySQL 8.0+** và **MariaDB 10.5+**.

## 📋 Cấu trúc

3 bảng theo đúng tài liệu kỹ thuật + 1 view thống kê:

| Bảng | Mục đích |
|---|---|
| `users` | Tài khoản người dùng |
| `refresh_tokens` | Quản lý JWT refresh tokens |
| `predictions` | Lịch sử dự đoán (input_data lưu JSON) |
| `v_user_prediction_stats` (view) | Thống kê nhanh số dự đoán mỗi user |

## 🚀 Cài đặt MySQL

### Windows
1. Tải MySQL Installer từ https://dev.mysql.com/downloads/installer/
2. Chọn "Server only" hoặc "Developer Default"
3. Đặt root password (nhớ lưu lại)

### macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

## 📥 Tạo database

### Cách 1: Dùng MySQL Workbench (GUI, dễ nhất)
1. Mở MySQL Workbench, kết nối tới localhost
2. File → Open SQL Script → chọn `schema.sql`
3. Bấm **⚡ Execute** (hoặc Ctrl+Shift+Enter)

### Cách 2: Dùng command line
```bash
mysql -u root -p < schema.sql
```

### Cách 3: Chạy từng bước trong MySQL CLI
```bash
mysql -u root -p
```
```sql
SOURCE /đường/dẫn/đến/schema.sql;
```

## 👤 Tạo user riêng cho ứng dụng (khuyến nghị)

Không nên dùng `root` cho production. Tạo user riêng:

```sql
-- Tạo user
CREATE USER 'diabetes_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';

-- Cấp quyền chỉ trên database này
GRANT ALL PRIVILEGES ON diabetes_db.* TO 'diabetes_user'@'localhost';
FLUSH PRIVILEGES;

-- Test thử
EXIT;
mysql -u diabetes_user -p diabetes_db
```

Sau đó cập nhật `backend/.env`:
```
DATABASE_URL=mysql+pymysql://diabetes_user:StrongPassword123!@localhost:3306/diabetes_db
```

## ✅ Kiểm tra database

```sql
USE diabetes_db;
SHOW TABLES;
-- Phải hiện: predictions, refresh_tokens, users, v_user_prediction_stats

DESCRIBE users;
DESCRIBE predictions;

-- Xem dữ liệu mẫu
SELECT id, email, full_name FROM users;
```

## 🧹 Reset database (xóa hết data)

Chạy lại `schema.sql` — đầu file đã có `DROP TABLE IF EXISTS` nên sẽ xóa hết và tạo lại.

## 📊 Sơ đồ ERD

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ email (UQ)      │◄────────────────┐
│ full_name       │                 │
│ password_hash   │                 │
│ date_of_birth   │                 │
│ is_active       │                 │
│ created_at      │                 │
│ updated_at      │                 │
└────────┬────────┘                 │
         │ 1                        │ 1
         │                          │
         │ N                        │ N
┌────────▼────────┐         ┌───────┴──────────┐
│ refresh_tokens  │         │   predictions    │
│─────────────────│         │──────────────────│
│ id (PK)         │         │ id (PK)          │
│ user_id (FK)    │         │ user_id (FK)     │
│ token_hash (UQ) │         │ input_data (JSON)│
│ expires_at      │         │ prediction       │
│ is_revoked      │         │ label            │
│ created_at      │         │ probability      │
└─────────────────┘         │ created_at       │
                            └──────────────────┘
```

## 🔍 Một số query hữu ích

```sql
-- Top 10 user có nhiều dự đoán nhất
SELECT * FROM v_user_prediction_stats
ORDER BY total_predictions DESC LIMIT 10;

-- Tỷ lệ diabetic/total toàn hệ thống
SELECT
  COUNT(*) AS total,
  SUM(prediction = 1) AS diabetic,
  ROUND(SUM(prediction = 1) * 100.0 / COUNT(*), 2) AS diabetic_pct
FROM predictions;

-- Truy vấn JSON: tìm các predictions có Glucose > 150
SELECT id, JSON_EXTRACT(input_data, '$.Glucose') AS glucose, probability
FROM predictions
WHERE JSON_EXTRACT(input_data, '$.Glucose') > 150
ORDER BY created_at DESC;

-- Xóa refresh tokens hết hạn (chạy cron định kỳ)
DELETE FROM refresh_tokens
WHERE expires_at < NOW() OR is_revoked = TRUE;
```
