import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/api/auth";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/authSlice";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/Spinner";
import { getErrorMessage } from "@/api/client";
import { EMAIL_PATTERN } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FormData {
  email: string;
  password: string;
  remember_me: boolean;
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { remember_me: false },
  });

  const fromPath = (location.state as { from?: string } | null)?.from || "/predict";

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await authApi.login(data);
      dispatch(setCredentials(res));
      toast("Đăng nhập thành công!", "success");
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast("Email hoặc mật khẩu không đúng", "error");
      } else if (err?.response?.status === 429) {
        toast("Quá nhiều lần thử. Vui lòng thử lại sau.", "warning");
      } else {
        toast(getErrorMessage(err), "error");
      }
      setSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <LogIn className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Chào mừng trở lại</h1>
          <p className="text-sm text-slate-500 mt-1">Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              autoComplete="email"
              {...register("email", {
                required: "Vui lòng nhập email",
                pattern: { value: EMAIL_PATTERN, message: "Email không hợp lệ" },
              })}
              className={cn(inputCls, errors.email && "border-rose-500")}
            />
            {errors.email && (
              <p className="text-rose-600 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                className={cn(
                  inputCls,
                  "pr-10",
                  errors.password && "border-rose-500"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Hiện/ẩn mật khẩu"
              >
                {showPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-rose-600 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              {...register("remember_me")}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Ghi nhớ đăng nhập (30 ngày)
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Spinner /> Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </main>
  );
}

const inputCls =
  "w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
