import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Inbox, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  usePredictionsQuery,
  useDeletePredictionMutation,
} from "@/hooks/queries";
import { Modal } from "@/components/Modal";
import { useToast } from "@/hooks/useToast";
import { formatDateTime, cn } from "@/lib/utils";
import type { PredictionRecord, ResultFilter } from "@/types";

export function History() {
  const toast = useToast();
  const deleteMut = useDeletePredictionMutation();

  // ===== Filter state (chỉ apply khi click "Áp dụng") =====
  const [pending, setPending] = useState<{
    result: ResultFilter;
    date_from: string;
    date_to: string;
  }>({ result: "all", date_from: "", date_to: "" });

  const [applied, setApplied] = useState(pending);
  const [page, setPage] = useState(1);
  const limit = 10;

  const query = useMemo(
    () => ({
      page,
      limit,
      result: applied.result,
      date_from: applied.date_from || undefined,
      date_to: applied.date_to || undefined,
    }),
    [page, applied]
  );

  const { data, isLoading, isFetching } = usePredictionsQuery(query);

  const items = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.total_pages ?? 0;

  // Modal chi tiết
  const [detailItem, setDetailItem] = useState<PredictionRecord | null>(null);

  // ===== Chart: chuẩn bị data 10 lần dự đoán gần nhất theo thời gian =====
  // Vì list đang sort DESC, chart cần ASC → reverse
  const chartData = useMemo(() => {
    return [...items]
      .reverse()
      .map((it, idx) => ({
        idx: idx + 1,
        date: formatDateTime(it.created_at).split(" ")[0],
        glucose: it.input_data.Glucose,
        bmi: it.input_data.BMI,
        probability: Math.round(it.probability * 100),
      }));
  }, [items]);

  function applyFilter() {
    setPage(1);
    setApplied(pending);
  }

  function resetFilter() {
    const empty = { result: "all" as ResultFilter, date_from: "", date_to: "" };
    setPending(empty);
    setApplied(empty);
    setPage(1);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc muốn xóa bản ghi này?")) return;
    try {
      await deleteMut.mutateAsync(id);
      toast("Đã xóa", "success");
      // Lùi page nếu vừa xóa record cuối của page
      if (page > 1 && total - 1 <= (page - 1) * limit) {
        setPage((p) => p - 1);
      }
    } catch (err) {
      toast("Xóa thất bại", "error");
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Lịch sử dự đoán
          </h1>
          <p className="text-slate-600 mt-1">
            Tất cả các lần dự đoán bạn đã thực hiện.
          </p>
        </div>
        <Link
          to="/predict"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Dự đoán mới
        </Link>
      </div>

      {/* Chart card */}
      {chartData.length >= 2 && (
        <div className="bg-white rounded-xl border border-slate-100 p-5 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Xu hướng theo thời gian (
            {chartData.length} lần gần nhất)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="idx" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <RechartTooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey="glucose"
                name="Glucose"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="bmi"
                name="BMI"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="probability"
                name="Xác suất (%)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4 grid sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Kết quả
          </label>
          <select
            value={pending.result}
            onChange={(e) =>
              setPending((p) => ({
                ...p,
                result: e.target.value as ResultFilter,
              }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Tất cả</option>
            <option value="diabetic">Có nguy cơ</option>
            <option value="normal">Bình thường</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            value={pending.date_from}
            onChange={(e) =>
              setPending((p) => ({ ...p, date_from: e.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            value={pending.date_to}
            onChange={(e) =>
              setPending((p) => ({ ...p, date_to: e.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={applyFilter}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Áp dụng
          </button>
          <button
            type="button"
            onClick={resetFilter}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Ngày giờ</th>
                <th className="px-4 py-3">Glucose</th>
                <th className="px-4 py-3">BMI</th>
                <th className="px-4 py-3">Tuổi</th>
                <th className="px-4 py-3">Kết quả</th>
                <th className="px-4 py-3">Xác suất</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? null : (
                items.map((it, i) => (
                  <Row
                    key={it.id}
                    item={it}
                    index={(page - 1) * limit + i}
                    onDetail={() => setDetailItem(it)}
                    onDelete={() => handleDelete(it.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && items.length === 0 && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Chưa có lịch sử nào</p>
            <p className="text-sm text-slate-500 mt-1">
              Hãy thực hiện dự đoán đầu tiên của bạn.
            </p>
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              Dự đoán ngay
            </Link>
          </div>
        )}

        {totalPages > 0 && (
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title="Chi tiết dự đoán"
      >
        {detailItem && <DetailContent item={detailItem} />}
      </Modal>
    </main>
  );
}

function Row({
  item,
  index,
  onDetail,
  onDelete,
}: {
  item: PredictionRecord;
  index: number;
  onDetail: () => void;
  onDelete: () => void;
}) {
  const isDiab = item.prediction === 1;
  const probPct = Math.round(item.probability * 100);
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3 text-slate-500">{index + 1}</td>
      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
        {formatDateTime(item.created_at)}
      </td>
      <td className="px-4 py-3">{item.input_data.Glucose ?? "—"}</td>
      <td className="px-4 py-3">{item.input_data.BMI ?? "—"}</td>
      <td className="px-4 py-3">{item.input_data.Age ?? "—"}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border",
            isDiab
              ? "bg-rose-100 text-rose-700 border-rose-200"
              : "bg-emerald-100 text-emerald-700 border-emerald-200"
          )}
        >
          {item.label}
        </span>
      </td>
      <td
        className={cn(
          "px-4 py-3 font-medium",
          isDiab ? "text-rose-600" : "text-emerald-600"
        )}
      >
        {probPct}%
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={onDetail}
          className="text-blue-600 hover:underline text-xs font-medium"
        >
          Xem
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-rose-600 hover:underline text-xs font-medium ml-3"
        >
          Xóa
        </button>
      </td>
    </tr>
  );
}

function DetailContent({ item }: { item: PredictionRecord }) {
  const isDiab = item.prediction === 1;
  const probPct = Math.round(item.probability * 100);
  const fields: [keyof typeof item.input_data, string][] = [
    ["Pregnancies", "Số lần mang thai"],
    ["Glucose", "Glucose (mg/dL)"],
    ["BloodPressure", "Huyết áp (mmHg)"],
    ["SkinThickness", "Độ dày da (mm)"],
    ["Insulin", "Insulin (μU/mL)"],
    ["BMI", "BMI"],
    ["DiabetesPedigreeFunction", "DPF"],
    ["Age", "Tuổi"],
  ];

  return (
    <>
      <div
        className={cn(
          "border rounded-lg p-4 mb-4",
          isDiab
            ? "bg-rose-50 border-rose-200"
            : "bg-emerald-50 border-emerald-200"
        )}
      >
        <p
          className={cn(
            "text-xs uppercase tracking-wide font-semibold mb-1",
            isDiab ? "text-rose-600" : "text-emerald-600"
          )}
        >
          Kết quả
        </p>
        <p
          className={cn(
            "font-bold",
            isDiab ? "text-rose-700" : "text-emerald-700"
          )}
        >
          {item.label}
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Xác suất: <span className="font-semibold">{probPct}%</span>
        </p>
      </div>
      <p className="text-xs text-slate-500 mb-2">
        Thực hiện lúc {formatDateTime(item.created_at)}
      </p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {fields.map(([k, lb]) => (
          <div key={k} className="bg-slate-50 rounded p-2.5">
            <p className="text-xs text-slate-500">{lb}</p>
            <p className="font-semibold text-slate-800">
              {item.input_data[k] ?? "—"}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function Pagination({
  page,
  limit,
  total,
  totalPages,
  onChange,
}: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const win = 2;
  const from = Math.max(1, page - win);
  const to = Math.min(totalPages, page + win);
  const pages: number[] = [];
  for (let p = from; p <= to; p++) pages.push(p);

  return (
    <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between text-sm">
      <p className="text-slate-600">
        Hiển thị {start}–{end} trên {total} kết quả
      </p>
      <div className="flex items-center gap-1">
        <PageBtn label="‹" disabled={page === 1} onClick={() => onChange(page - 1)} />
        {pages.map((p) => (
          <PageBtn
            key={p}
            label={String(p)}
            active={p === page}
            onClick={() => onChange(p)}
          />
        ))}
        <PageBtn
          label="›"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        />
      </div>
    </div>
  );
}

function PageBtn({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-3 py-1 rounded transition",
        active
          ? "bg-blue-600 text-white"
          : disabled
          ? "text-slate-300 cursor-not-allowed"
          : "hover:bg-slate-100 text-slate-700"
      )}
    >
      {label}
    </button>
  );
}
