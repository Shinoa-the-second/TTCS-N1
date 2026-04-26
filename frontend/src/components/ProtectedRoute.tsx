import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store";

/** Bọc routes cần auth. Nếu chưa login → redirect /login (giữ lại location). */
export function ProtectedRoute() {
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Ngược lại: nếu ĐÃ login → redirect /predict. Dùng cho /login, /register. */
export function PublicOnlyRoute() {
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  if (isAuth) return <Navigate to="/predict" replace />;
  return <Outlet />;
}
