# Frontend — React + Vite + TypeScript

Frontend hiện đại với stack:

- **Vite** — build tool nhanh, HMR
- **React 18** + **TypeScript**
- **Tailwind CSS v4** (qua `@tailwindcss/vite`)
- **Redux Toolkit** — auth state + toast
- **TanStack Query** — server state + cache
- **react-hook-form** — form validation
- **Axios** — HTTP client
- **Lucide React** — icons
- **Recharts** — biểu đồ thống kê
- **React Router v6** — routing

## 📦 Cài đặt

```bash
npm install
```

> Cài lần đầu mất ~1-2 phút. Đảm bảo Node.js ≥ 18.

## ⚙️ Cấu hình `.env`

```bash
cp .env.example .env
```

Nội dung mặc định trong `.env.example`:

```env
VITE_BACKEND_URL=http://localhost:8001
VITE_AI_SERVICE_URL=http://localhost:8000
```

Đổi nếu backend/AI chạy ở URL khác.

## 🚀 Chạy dev server

```bash
npm run dev
```

→ Mở http://localhost:5173

## 📦 Build production

```bash
npm run build
```

Output trong `dist/`. Có thể serve bằng:

```bash
npm run preview      # preview build local
```

Hoặc deploy `dist/` lên Vercel, Netlify, S3, Nginx...

## 📁 Cấu trúc

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Router
│   ├── index.css             # Tailwind + globals
│   │
│   ├── api/                  # Axios + endpoint clients
│   │   ├── client.ts         #   - Axios instances + JWT interceptor
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── predictions.ts
│   │   └── ai.ts
│   │
│   ├── store/                # Redux Toolkit
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   └── toastSlice.ts
│   │
│   ├── hooks/
│   │   ├── useToast.ts
│   │   └── queries.ts        # TanStack Query hooks
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Toast.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Modal.tsx
│   │   └── Spinner.tsx
│   │
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Register.tsx
│   │   ├── Login.tsx
│   │   ├── Predict.tsx       # Core: form 8 chỉ số + kết quả AI
│   │   ├── History.tsx       # List + filter + pagination + chart
│   │   └── Profile.tsx       # Tabs + pie chart + đổi MK
│   │
│   ├── lib/
│   │   ├── constants.ts      # 8 fields schema, sample data, regex
│   │   └── utils.ts          # cn(), formatDateTime, riskLevel colors
│   │
│   └── types/
│       └── index.ts          # All TS types
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── index.html
```

## 🧭 Luồng sử dụng

1. Vào http://localhost:5173 → Landing
2. Click **Đăng ký** → tạo tài khoản → redirect Login
3. Đăng nhập → JWT lưu localStorage → redirect `/predict`
4. Trang **Dự đoán**:
   - Click "Điền mẫu" → fill data demo
   - Click "Dự đoán ngay" → frontend gọi `POST :8000/predict` (AI) → đồng thời `POST :8001/api/predictions` (Backend lưu lịch sử)
   - Card kết quả màu theo `risk_level` (Cao=đỏ / TB=cam / Thấp=xanh)
5. **Lịch sử**: bảng + filter + chart Recharts xu hướng Glucose/BMI/probability
6. **Hồ sơ**: tabs info/đổi mật khẩu, pie chart tỷ lệ kết quả

## 🎨 Tailwind CSS v4

Dùng `@import "tailwindcss"` trong `index.css` — không cần `tailwind.config.js`.
Plugin `@tailwindcss/vite` xử lý hết.

## 🐛 Troubleshooting

### `npm install` báo lỗi peer dependency
```bash
npm install --legacy-peer-deps
```

### "Không kết nối được tới máy chủ" khi predict
→ AI Service (port 8000) chưa chạy. Khởi động AI service trước.

### Token hết hạn liên tục
→ JWT default 1h. Đổi `ACCESS_TOKEN_EXPIRE_MINUTES` trong `backend/.env`.

### CORS error
→ `backend/.env` thiếu `FRONTEND_ORIGIN=http://localhost:5173`.
