import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types";

/* ============================================================
   Tạo 2 Axios instances:
   - apiClient   → Backend (đính JWT, xử lý 401 redirect)
   - aiClient    → AI Service (không cần auth)
   ============================================================ */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";

const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

export const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
});

/* ============================================================
   Token storage helpers (localStorage)
   ============================================================ */

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

/* ============================================================
   Request interceptor: tự đính Bearer token
   ============================================================ */
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ============================================================
   Response interceptor: chuẩn hóa error message + handle 401
   Khi token hết hạn → xóa token + redirect /login
   ============================================================ */
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401 && tokenStorage.getAccess()) {
      tokenStorage.clear();
      // Tránh loop redirect khi đang ở /login
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/* ============================================================
   Helper: parse message lỗi từ axios error
   ============================================================ */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
    if (data?.errors?.[0]?.message) return data.errors[0].message;
    if (error.code === "ERR_NETWORK") return "Không kết nối được tới máy chủ";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Có lỗi xảy ra";
}

/** Lấy field-level errors từ 422 response để gắn vào react-hook-form. */
export function getFieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (axios.isAxiosError(error)) {
    const errors = (error.response?.data as ApiErrorResponse | undefined)?.errors;
    errors?.forEach((e) => {
      if (e.field) result[e.field] = e.message;
    });
  }
  return result;
}
