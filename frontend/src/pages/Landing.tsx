import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  History,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
              🧠 AI MACHINE LEARNING
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">
              Dự đoán nguy cơ{" "}
              <span className="text-blue-600">tiểu đường</span> trong vài giây
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Hệ thống sử dụng mô hình Machine Learning huấn luyện trên bộ dữ
              liệu y tế chuẩn, phân tích 8 chỉ số sức khỏe để đánh giá nguy cơ
              mắc tiểu đường của bạn.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
              >
                Bắt đầu ngay <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition"
              >
                Tìm hiểu thêm
              </a>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              ⚕️ Lưu ý: kết quả mang tính tham khảo, không thay thế chẩn đoán
              của bác sĩ.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  Kết quả dự đoán
                </p>
                <p className="text-xs text-slate-500">
                  Cập nhật theo thời gian thực
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Xác suất</span>
                  <span className="font-semibold text-emerald-600">22%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: "22%" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Stat label="Glucose" value="118" />
                <Stat label="BMI" value="24.3" />
                <Stat label="Age" value="35" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Tính năng nổi bật
        </h2>
        <p className="text-center text-slate-600 mb-10">
          Mọi thứ bạn cần để theo dõi sức khỏe
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            icon={Zap}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            title="Dự đoán nhanh"
            desc="Chỉ cần nhập 8 chỉ số sức khỏe, kết quả trả về trong vòng 1 giây."
          />
          <Feature
            icon={History}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            title="Lưu lịch sử"
            desc="Tự động lưu mọi lần dự đoán, dễ dàng xem lại và so sánh theo thời gian."
          />
          <Feature
            icon={ShieldCheck}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            title="Bảo mật dữ liệu"
            desc="Mật khẩu mã hóa bcrypt, JWT authentication, dữ liệu chỉ bạn xem được."
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
            Cách thức hoạt động
          </h2>
          <p className="text-center text-slate-600 mb-12">3 bước đơn giản</p>
          <div className="grid md:grid-cols-3 gap-8">
            <Step n={1} title="Đăng ký tài khoản" desc="Chỉ cần email và mật khẩu để bắt đầu sử dụng miễn phí." />
            <Step n={2} title="Nhập chỉ số y tế" desc="Glucose, BMI, huyết áp, độ dày da, insulin, tuổi..." />
            <Step n={3} title="Nhận kết quả" desc="AI phân tích và đưa ra dự đoán kèm xác suất chi tiết." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-3">
            Sẵn sàng kiểm tra sức khỏe của bạn?
          </h2>
          <p className="text-blue-50 mb-6">
            Đăng ký miễn phí và bắt đầu dự đoán ngay hôm nay.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Tạo tài khoản
          </Link>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm">
          <p>© 2024 Diabetes Prediction System. Bài tập tốt nghiệp / Đồ án.</p>
          <p className="text-slate-400 mt-2 text-xs">
            Sản phẩm sử dụng dữ liệu Pima Indians Diabetes Dataset, mục đích học tập.
          </p>
        </div>
      </footer>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function Feature({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-100 hover:-translate-y-1 hover:shadow-lg transition">
      <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
        {n}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{desc}</p>
    </div>
  );
}
