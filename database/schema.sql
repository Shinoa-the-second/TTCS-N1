-- ============================================================
-- DIABETES PREDICTION SYSTEM — MYSQL DATABASE SCHEMA
-- Tương thích MySQL 8.0+ và MariaDB 10.5+
-- ============================================================

-- Tạo database (chạy với quyền root nếu chưa có)
CREATE DATABASE IF NOT EXISTS diabetes_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE diabetes_db;

-- ============================================================
-- DROP các bảng cũ (nếu cần reset)
-- Theo thứ tự ngược dependency để tránh lỗi FK
-- ============================================================
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

-- ============================================================
-- BẢNG 1: users
-- Lưu thông tin tài khoản người dùng
-- ============================================================
CREATE TABLE users (
  id              CHAR(36)        NOT NULL  COMMENT 'UUID v4 (sinh từ application)',
  email           VARCHAR(255)    NOT NULL  COMMENT 'Email đăng nhập, duy nhất',
  full_name       VARCHAR(255)    NOT NULL  COMMENT 'Họ tên đầy đủ',
  password_hash   VARCHAR(255)    NOT NULL  COMMENT 'bcrypt hash, cost=12',
  date_of_birth   DATE            NULL      COMMENT 'Ngày sinh (optional)',
  is_active       BOOLEAN         NOT NULL  DEFAULT TRUE
                                            COMMENT 'TRUE = active, FALSE = vô hiệu hóa',
  created_at      TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_is_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Bảng tài khoản người dùng';

-- ============================================================
-- BẢNG 2: refresh_tokens
-- Quản lý refresh tokens, hỗ trợ logout / đổi mật khẩu
-- ============================================================
CREATE TABLE refresh_tokens (
  id              CHAR(36)        NOT NULL,
  user_id         CHAR(36)        NOT NULL  COMMENT 'FK -> users.id',
  token_hash      VARCHAR(255)    NOT NULL  COMMENT 'SHA-256 hash của refresh token',
  expires_at      TIMESTAMP       NOT NULL  COMMENT 'Hạn của token',
  is_revoked      BOOLEAN         NOT NULL  DEFAULT FALSE,
  created_at      TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_refresh_tokens_hash (token_hash),
  KEY idx_refresh_tokens_user_id (user_id),
  KEY idx_refresh_tokens_expires (expires_at),

  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Refresh tokens cho JWT auth';

-- ============================================================
-- BẢNG 3: predictions
-- Lịch sử dự đoán của người dùng. input_data lưu dạng JSON
-- ============================================================
CREATE TABLE predictions (
  id              CHAR(36)        NOT NULL,
  user_id         CHAR(36)        NOT NULL  COMMENT 'FK -> users.id',
  input_data      JSON            NOT NULL  COMMENT '8 chỉ số đầu vào dạng JSON',
  prediction      TINYINT         NOT NULL  COMMENT '0 = không mắc, 1 = có tiểu đường',
  label           VARCHAR(100)    NOT NULL  COMMENT 'Nhãn hiển thị',
  probability     DECIMAL(5,4)    NOT NULL  COMMENT 'Xác suất class 1 (0.0000 - 1.0000)',
  created_at      TIMESTAMP       NOT NULL  DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_predictions_user_created (user_id, created_at DESC),
  KEY idx_predictions_user_prediction (user_id, prediction),
  KEY idx_predictions_created_at (created_at),

  CONSTRAINT fk_predictions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT chk_prediction_value
    CHECK (prediction IN (0, 1)),

  CONSTRAINT chk_probability_range
    CHECK (probability >= 0 AND probability <= 1)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Lịch sử dự đoán tiểu đường';

-- ============================================================
-- DỮ LIỆU MẪU (optional, tiện cho dev/demo)
-- Tài khoản: demo@example.com / Demo@1234
-- bcrypt cost=12 hash của 'Demo@1234'
-- ============================================================
INSERT INTO users (id, email, full_name, password_hash, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo@example.com',
  'Demo User',
  '$2b$12$rE0xBQ.GiQjmJqQYhvZ7zOLEqiD8nLXAjfqDUGGkxhAqHaCW3owr2',
  TRUE
);

-- ============================================================
-- VIEW: thống kê nhanh cho mỗi user (tùy chọn)
-- ============================================================
CREATE OR REPLACE VIEW v_user_prediction_stats AS
SELECT
  u.id              AS user_id,
  u.email           AS email,
  u.full_name       AS full_name,
  COUNT(p.id)       AS total_predictions,
  SUM(CASE WHEN p.prediction = 1 THEN 1 ELSE 0 END) AS diabetic_count,
  SUM(CASE WHEN p.prediction = 0 THEN 1 ELSE 0 END) AS normal_count,
  MAX(p.created_at) AS last_predicted_at
FROM users u
LEFT JOIN predictions p ON p.user_id = u.id
GROUP BY u.id, u.email, u.full_name;

-- ============================================================
-- KIỂM TRA NHANH
-- ============================================================
SHOW TABLES;
SELECT 'Schema created successfully!' AS status;
