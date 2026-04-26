import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/api/auth";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/Spinner";
import { getErrorMessage, getFieldErrors } from "@/api/client";
import {
  PASSWORD_PATTERN,
  PASSWORD_HINT,
  EMAIL_PATTERN,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormData>();

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await authApi.register({
        full_name: data.full_name.trim(),
        email: data.email.trim(),
        password: data.password,
      });
      toast("Đăng ký thành công! Đang chuyển sang trang đăng nhập...", "success");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError("email", { message: "Email đã được sử dụng" });
      } else if (err?.response?.status === 422) {
        const fieldErrors = getFieldErrors(err);
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          setError(field as keyof FormData, { message: msg });
        });
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
            <UserPlus className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản mới</h1>
          <p className="text-sm text-slate-500 mt-1">Miễn phí, chỉ tốn 30 giây</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Họ và tên" error={errors.full_name?.message}>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              {...register("full_name", {
                required: "Vui lòng nhập họ và tên",
                minLength: {
                  value: 2,
                  message: "Tối thiểu 2 ký tự",
                },
              })}
              className={cn(inputCls, errors.full_name && "border-rose-500")}
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email", {
                required: "Vui lòng nhập email",
                pattern: {
                  value: EMAIL_PATTERN,
                  message: "Email không hợp lệ",
                },
              })}
              className={cn(inputCls, errors.email && "border-rose-500")}
            />
          </Field>

          <Field
            label="Mật khẩu"
            error={errors.password?.message}
            hint={PASSWORD_HINT}
          >
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Tối thiểu 8 ký tự"
                autoComplete="new-password"
                {...register("password", {
                  required: "Vui lòng nhập mật khẩu",
                  pattern: {
                    value: PASSWORD_PATTERN,
                    message: PASSWORD_HINT,
                  },
                })}
                className={cn(inputCls, "pr-10", errors.password && "border-rose-500")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Hiện/ẩn mật khẩu"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="Xác nhận mật khẩu" error={errors.confirm_password?.message}>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                {...register("confirm_password", {
                  required: "Vui lòng xác nhận mật khẩu",
                  validate: (v) => v === password || "Mật khẩu xác nhận không khớp",
                })}
                className={cn(inputCls, "pr-10", errors.confirm_password && "border-rose-500")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Hiện/ẩn mật khẩu"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Spinner /> Đang xử lý...
              </>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}

const inputCls =
  "w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-rose-600 text-xs mt-1">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}
