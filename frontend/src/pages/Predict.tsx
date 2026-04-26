import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Activity,
  ClipboardList,
  Sparkles,
  RotateCcw,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Check,
  AlertCircle,
} from "lucide-react";
import { aiApi } from "@/api/ai";
import { Spinner } from "@/components/Spinner";
import { Tooltip } from "@/components/Tooltip";
import { useToast } from "@/hooks/useToast";
import { useCreatePredictionMutation } from "@/hooks/queries";
import { FIELDS, SAMPLE_INPUT } from "@/lib/constants";
import {
  cn,
  deriveRiskLevel,
  riskLevelColors,
} from "@/lib/utils";
import {
  getErrorMessage,
} from "@/api/client";
import type { AIPredictResponse, DiabetesInput } from "@/types";

export function Predict() {
  const toast = useToast();
  const createMut = useCreatePredictionMutation();

  const [result, setResult] = useState<AIPredictResponse | null>(null);
  const [savedToHistory, setSavedToHistory] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DiabetesInput>();

  function fillSample() {
    Object.entries(SAMPLE_INPUT).forEach(([k, v]) => {
      setValue(k as keyof DiabetesInput, v);
    });
  }

  function clearForm() {
    reset();
    setResult(null);
    setSavedToHistory(false);
  }

  const onSubmit = async (data: DiabetesInput) => {
    try {
      // 1. Gọi AI Service
      const ai = await aiApi.predict(data);

      // 2. Lưu vào Backend (best-effort)
      let saved = false;
      try {
        await createMut.mutateAsync({
          input_data: data,
          prediction: ai.prediction,
          label: ai.diagnosis ?? ai.label ?? "Không có nguy cơ",
          probability: ai.probability,
        });
        saved = true;
      } catch (e) {
        console.warn("Lưu lịch sử thất bại:", e);
      }

      setResult(ai);
      setSavedToHistory(saved);
      // Scroll vào kết quả trên mobile
      setTimeout(() => {
        document
          .getElementById("result-card")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } catch (err) {
      toast(`Không gọi được AI Service: ${getErrorMessage(err)}`, "error");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Dự đoán nguy cơ tiểu đường
        </h1>
        <p className="text-slate-600 mt-1">
          Nhập đầy đủ 8 chỉ số y tế bên dưới để nhận kết quả từ AI.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
          noValidate
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Chỉ số y tế
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    {f.label}
                    {f.unit && (
                      <span className="text-xs text-slate-500 font-normal">
                        ({f.unit})
                      </span>
                    )}
                  </span>
                  <Tooltip text={f.tip} />
                </label>
                <input
                  type="number"
                  step={f.step}
                  placeholder={`${f.min}–${f.max}`}
                  {...register(f.key, {
                    required: "Trường bắt buộc",
                    valueAsNumber: true,
                    min: { value: f.min, message: `Tối thiểu ${f.min}` },
                    max: { value: f.max, message: `Tối đa ${f.max}` },
                    validate: f.integer
                      ? (v) => Number.isInteger(v) || "Phải là số nguyên"
                      : undefined,
                  })}
                  className={cn(
                    "w-full px-3 py-2.5 border rounded-lg outline-none transition",
                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors[f.key] ? "border-rose-500" : "border-slate-300"
                  )}
                />
                {errors[f.key] && (
                  <p className="text-rose-600 text-xs mt-1">
                    {errors[f.key]?.message as string}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Spinner /> Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Dự đoán ngay
                </>
              )}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Xóa
            </button>
            <button
              type="button"
              onClick={fillSample}
              className="px-5 py-3 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <Lightbulb className="w-4 h-4" /> Điền mẫu
            </button>
          </div>
        </form>

        {/* Result */}
        <div className="lg:col-span-2">
          {!result ? (
            <div className="bg-white rounded-2xl shadow-sm border border-dashed border-slate-200 p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <Activity className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">Chưa có kết quả</p>
              <p className="text-sm text-slate-500 mt-1">
                Điền form và click "Dự đoán ngay" để xem kết quả AI.
              </p>
            </div>
          ) : (
            <ResultCard ai={result} saved={savedToHistory} />
          )}
        </div>
      </div>
    </main>
  );
}

function ResultCard({
  ai,
  saved,
}: {
  ai: AIPredictResponse;
  saved: boolean;
}) {
  const isDiabetic = ai.prediction === 1;
  const probPct = Math.round(ai.probability * 100);
  const riskLevel = ai.risk_level || deriveRiskLevel(ai.probability);
  const c = riskLevelColors(riskLevel);

  return (
    <div
      id="result-card"
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <div className={cn(c.bg, c.border, "border-b p-5")}>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 text-white rounded-full flex items-center justify-center",
              c.chip
            )}
          >
            {isDiabetic ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
          </div>
          <div>
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                c.text
              )}
            >
              Kết quả
            </p>
            <p className={cn("font-bold text-lg leading-tight", c.text)}>
              {isDiabetic ? "CÓ NGUY CƠ TIỂU ĐƯỜNG" : "KHÔNG CÓ NGUY CƠ"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-600">Xác suất</span>
            <span className={cn("font-bold", c.text)}>{probPct}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", c.bar)}
              style={{ width: `${probPct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-0.5">Mức độ nguy cơ</p>
            <p className="font-semibold text-slate-800">{riskLevel}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-0.5">Phân loại AI</p>
            <p className="font-semibold text-slate-800">
              {ai.label || ai.diagnosis}
            </p>
          </div>
        </div>

        <div
          className={cn("text-sm rounded-lg p-3 border", c.bg, c.border, "text-slate-700")}
        >
          {isDiabetic
            ? "⚕️ Khuyến nghị: Bạn nên tới gặp bác sĩ để thực hiện các xét nghiệm chính xác."
            : "💚 Khuyến nghị: Duy trì lối sống lành mạnh, vận động đều đặn và kiểm tra định kỳ."}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã lưu vào lịch sử</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Chưa lưu được vào lịch sử</span>
            </>
          )}
          <Link to="/history" className="ml-auto text-blue-600 hover:underline">
            Xem lịch sử →
          </Link>
        </div>
      </div>
    </div>
  );
}
