import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Activity, ChevronDown, User, History, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/authSlice";
import { authApi } from "@/api/auth";
import { tokenStorage } from "@/api/client";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export function Navbar() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [open]);

  async function handleLogout() {
    try {
      const rt = tokenStorage.getRefresh();
      if (rt) await authApi.logout(rt);
    } catch {
      // bỏ qua, vẫn logout phía client
    }
    dispatch(logout());
    toast("Đã đăng xuất", "success");
    navigate("/login", { replace: true });
  }

  const initial = (user?.full_name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to={isAuth ? "/predict" : "/"} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">Diabetes Predict</span>
        </Link>

        {isAuth ? (
          <>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <NavItem to="/predict" label="Dự đoán" />
              <NavItem to="/history" label="Lịch sử" />
              <NavItem to="/profile" label="Hồ sơ" />
            </div>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((o) => !o);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  {initial}
                </div>
                <span className="text-sm text-slate-700 hidden sm:inline">
                  {user?.full_name || user?.email}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4" /> Hồ sơ
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <History className="w-4 h-4" /> Lịch sử
                  </Link>
                  <hr className="my-1 border-slate-200" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "transition-colors",
          isActive
            ? "text-blue-600 font-semibold"
            : "text-slate-600 hover:text-blue-600"
        )
      }
    >
      {label}
    </NavLink>
  );
}
