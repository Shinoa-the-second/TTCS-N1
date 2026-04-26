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

/** 8 chỉ số y tế — đồng bộ với Pydantic backend & docx. */
export const FIELDS: FieldSchema[] = [
  {
    key: "Pregnancies",
    label: "Số lần mang thai",
    unit: "",
    min: 0,
    max: 20,
    step: 1,
    integer: true,
    tip: "Số lần đã mang thai. Nam giới điền 0.",
  },
  {
    key: "Glucose",
    label: "Glucose",
    unit: "mg/dL",
    min: 1,
    max: 300,
    step: 0.1,
    tip: "Nồng độ glucose huyết tương sau test dung nạp 2 giờ. Bình thường: 70–140 mg/dL.",
  },
  {
    key: "BloodPressure",
    label: "Huyết áp",
    unit: "mmHg",
    min: 1,
    max: 200,
    step: 0.1,
    tip: "Huyết áp tâm trương (số dưới khi đo huyết áp). Bình thường: 60–80 mmHg.",
  },
  {
    key: "SkinThickness",
    label: "Độ dày da",
    unit: "mm",
    min: 0,
    max: 100,
    step: 0.1,
    tip: "Độ dày nếp gấp da cơ tam đầu, đo bằng caliper. Thông thường 10–40 mm.",
  },
  {
    key: "Insulin",
    label: "Insulin",
    unit: "μU/mL",
    min: 0,
    max: 1000,
    step: 0.1,
    tip: "Nồng độ insulin huyết thanh sau 2 giờ. Bình thường: 16–166 μU/mL.",
  },
  {
    key: "BMI",
    label: "BMI",
    unit: "kg/m²",
    min: 0.1,
    max: 100,
    step: 0.1,
    tip: "Chỉ số khối cơ thể = cân nặng (kg) / chiều cao² (m²). Bình thường: 18.5–24.9.",
  },
  {
    key: "DiabetesPedigreeFunction",
    label: "Diabetes Pedigree Function",
    unit: "",
    min: 0,
    max: 3,
    step: 0.001,
    tip: "Hệ số di truyền nguy cơ tiểu đường trong gia đình (0–3). Càng cao, nguy cơ di truyền càng lớn.",
  },
  {
    key: "Age",
    label: "Tuổi",
    unit: "năm",
    min: 21,
    max: 120,
    step: 1,
    integer: true,
    tip: "Tuổi hiện tại của người được khám.",
  },
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
