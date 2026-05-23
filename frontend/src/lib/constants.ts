import type { DiabetesInput } from "@/types";

export interface FieldSchema {
  key: keyof DiabetesInput;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  integer?: boolean;
  tip: string;
}

export const FIELDS = [
  {
    key: "Pregnancies",
    label: "Số lần mang thai",
    unit: "lần",
    min: 0,
    max: 17,
    step: 1,
    integer: true,
    tip: "Số lần mang thai thực tế (Tối đa 17 theo tập dữ liệu Pima)."
  },
  {
    key: "Glucose",
    label: "Glucose",
    unit: "mg/dL",
    min: 44,
    max: 200,
    step: 1,
    integer: true,
    tip: "Nồng độ Glucose trong huyết tương sau 2 giờ trong xét nghiệm dung nạp glucose đường uống."
  },
  {
    key: "BloodPressure",
    label: "Huyết áp",
    unit: "mmHg",
    min: 24,
    max: 122,
    step: 1,
    integer: true,
    tip: "Huyết áp tâm trương thực tế (Bình thường dao động từ 60–80 mmHg)."
  },
  {
    key: "SkinThickness",
    label: "Độ dày da",
    unit: "mm",
    min: 7,
    max: 99,
    step: 1,
    integer: true,
    tip: "Độ dày nếp gấp da cơ tam đầu dùng để ước tính lượng mỡ cơ thể."
  },
  {
    key: "Insulin",
    label: "Insulin",
    unit: "μU/mL",
    min: 14,
    max: 846,
    step: 1,
    integer: true,
    tip: "Nồng độ định lượng Insulin huyết thanh sau 2 giờ."
  },
  {
    key: "BMI",
    label: "BMI",
    unit: "kg/m²",
    min: 18.0,
    max: 67.0,
    step: 0.1,
    integer: false,
    tip: "Chỉ số khối cơ thể = Cân nặng (kg) / (Chiều cao x Chiều cao) (m)."
  },
  {
    key: "DiabetesPedigreeFunction",
    label: "Chỉ số di truyền tiểu đường",
    unit: "DPF",
    min: 0.08,
    max: 2.42,
    step: 0.001,
    integer: false,
    tip: "Hệ số hàm lịch sử gia đình thể hiện mức độ di truyền bệnh tiểu đường."
  },
  {
    key: "Age",
    label: "Tuổi",
    unit: "năm",
    min: 21,
    max: 81,
    step: 1,
    integer: true,
    tip: "Tuổi của người thực hiện xét nghiệm (Tập dữ liệu giới hạn từ 21 tuổi trở lên)."
  }
];
export const SAMPLE_INPUT: DiabetesInput = {
  Pregnancies: 2,
  Glucose: 138,
  BloodPressure: 62,
  SkinThickness: 35,
  Insulin: 50,
  BMI: 33.6,
  DiabetesPedigreeFunction: 0.127,
  Age: 47,
};

export const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;

export const PASSWORD_HINT =
  "Ít nhất 8 ký tự, có chữ hoa, số và ký tự đặc biệt";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
