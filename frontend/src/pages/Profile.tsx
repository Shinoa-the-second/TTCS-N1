import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useMeQuery, useUpdateUserMutation } from "@/hooks/queries";
import { authApi } from "@/api/auth";
import { useAppDispatch } from "@/store";
import { logout, updateUser } from "@/store/authSlice";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/Spinner";
import {
  PASSWORD_PATTERN,
  PASSWORD_HINT,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/api/client";

type Tab = "info" | "password";

export function Profile() {
  const [tab, setTab] = useState<Tab>("info");
  const { data: me, isLoading } = useMeQuery();

  const total = me?.prediction_stats.total ?? 0;
  const diabetic = me?.prediction_stats.diabetic ?? 0;
  const normal = me?.prediction_stats.normal ?? 0;

  const initial = (me?.full_name || me?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const pieData = [
    { name: "Bình thường", value: normal, color: "#10b981" },
    { name: "Có nguy cơ", value: diabetic, color: "#f43f5e" },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
        Hồ sơ cá nhân
      </h1>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shrink-0">
          {isLoading ? <span className="skeleton w-12 h-6" /> : initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg text-slate-900 truncate">
            {isLoading ? <span className="skeleton inline-block h-5 w-32" /> : me?.full_name}
          </p>
          <p className="text-sm text-slate-600 truncate">
            {isLoading ? <span className="skeleton inline-block h-4 w-48" /> : me?.email}
          </p>
        </div>
      </div>

      {/* Stats + chart */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Tổng" value={total} color="text-slate-900" />
          <StatCard label="Có nguy cơ" value={diabetic} color="text-rose-600" />
          <StatCard label="Bình thường" value={normal} color="text-emerald-600" />
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-medium text-slate-600 uppercase mb-2">
            Phân bố kết quả
          </p>
          {total === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Chưa có dữ liệu
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-200 flex">
          <TabButton active={tab === "info"} onClick={() => setTab("info")}>
            Thông tin cá nhân
          </TabButton>
          <TabButton active={tab === "password"} onClick={() => setTab("password")}>
            Đổi mật khẩu
          </TabButton>
        </div>

        <div className="p-6">
          {tab === "info" ? <InfoForm /> : <PasswordForm />}
        </div>
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 py-3 text-sm font-medium border-b-2 transition",
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-slate-600 hover:text-slate-800"
      )}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={cn("text-2xl font-bold mt-1", color)}>{value}</p>
    </div>
  );
}

/* ============================================================
   Tab: Info — cập nhật full_name + date_of_birth
   ============================================================ */
function InfoForm() {
  const { data: me } = useMeQuery();
  const updateMut = useUpdateUserMutation();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ full_name: string; date_of_birth: string }>({
    defaultValues: { full_name: "", date_of_birth: "" },
  });

  // Khi me load xong → fill vào form
  useEffect(() => {
    if (me) {
      reset({
        full_name: me.full_name,
        date_of_birth: me.date_of_birth ?? "",
      });
    }
  }, [me, reset]);

  const onSubmit = async (data: { full_name: string; date_of_birth: string }) => {
    try {
      const res = await updateMut.mutateAsync({
        full_name: data.full_name.trim(),
        date_of_birth: data.date_of_birth || null,
      });
      dispatch(
        updateUser({
          id: res.id,
          email: res.email,
          full_name: res.full_name,
          created_at: res.created_at,
        })
      );
      toast("Cập nhật thành công", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md" noValidate>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Họ và tên
        </label>
        <input
          type="text"
          {...register("full_name", {
            required: "Vui lòng nhập họ tên",
            minLength: { value: 2, message: "Tối thiểu 2 ký tự" },
          })}
          className={cn(
            inputCls,
            errors.full_name && "border-rose-500"
          )}
        />
        {errors.full_name && (
          <p className="text-rose-600 text-xs mt-1">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={me?.email ?? ""}
          readOnly
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
        />
        <p className="text-xs text-slate-500 mt-1">Email không thể thay đổi.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Ngày sinh
        </label>
        <input
          type="date"
          {...register("date_of_birth")}
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg font-medium transition disabled:opacity-60 flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Spinner /> Đang lưu...
          </>
        ) : (
          "Lưu thay đổi"
        )}
      </button>
    </form>
  );
}

/* ============================================================
   Tab: Đổi mật khẩu
   ============================================================ */
function PasswordForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{
    old_password: string;
    new_password: string;
    confirm_new_password: string;
  }>();

  const newPwd = watch("new_password");

  const onSubmit = async (data: {
    old_password: string;
    new_password: string;
    confirm_new_password: string;
  }) => {
    try {
      await authApi.changePassword(data);
      toast("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.", "success");
      reset();
      // Server đã invalidate refresh tokens, force logout phía client
      setTimeout(() => {
        dispatch(logout());
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("old_password", {
          message: "Mật khẩu hiện tại không đúng",
        });
      } else {
        toast(getErrorMessage(err), "error");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md" noValidate>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Mật khẩu hiện tại
        </label>
        <input
          type="password"
          autoComplete="current-password"
          {...register("old_password", { required: "Vui lòng nhập mật khẩu hiện tại" })}
          className={cn(inputCls, errors.old_password && "border-rose-500")}
        />
        {errors.old_password && (
          <p className="text-rose-600 text-xs mt-1">
            {errors.old_password.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Mật khẩu mới
        </label>
        <input
          type="password"
          autoComplete="new-password"
          {...register("new_password", {
            required: "Vui lòng nhập mật khẩu mới",
            pattern: { value: PASSWORD_PATTERN, message: PASSWORD_HINT },
          })}
          className={cn(inputCls, errors.new_password && "border-rose-500")}
        />
        {errors.new_password ? (
          <p className="text-rose-600 text-xs mt-1">
            {errors.new_password.message}
          </p>
        ) : (
          <p className="text-xs text-slate-500 mt-1">{PASSWORD_HINT}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Xác nhận mật khẩu mới
        </label>
        <input
          type="password"
          autoComplete="new-password"
          {...register("confirm_new_password", {
            required: "Vui lòng xác nhận mật khẩu",
            validate: (v) => v === newPwd || "Mật khẩu xác nhận không khớp",
          })}
          className={cn(
            inputCls,
            errors.confirm_new_password && "border-rose-500"
          )}
        />
        {errors.confirm_new_password && (
          <p className="text-rose-600 text-xs mt-1">
            {errors.confirm_new_password.message}
          </p>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg p-3">
        ⚠️ Sau khi đổi mật khẩu, bạn sẽ bị đăng xuất khỏi tất cả thiết bị khác.
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-5 rounded-lg font-medium transition disabled:opacity-60 flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Spinner /> Đang đổi...
          </>
        ) : (
          "Đổi mật khẩu"
        )}
      </button>
    </form>
  );
}

const inputCls =
  "w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition";
