/* ============================================================
   Domain types — khớp với schemas Pydantic của Backend
   ============================================================ */

export interface User {
  id: string;
  email: string;
  full_name: string;
  date_of_birth?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PredictionStats {
  total: number;
  diabetic: number;
  normal: number;
}

export interface UserMe extends User {
  prediction_stats: PredictionStats;
}

export interface DiabetesInput {
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
}

export interface AIPredictResponse {
  prediction: 0 | 1;
  diagnosis: string;
  risk_level: "Cao" | "Trung bình" | "Thấp";
  probability: number;
  label: string;
}

export interface PredictionRecord {
  id: string;
  created_at: string;
  input_data: DiabetesInput;
  prediction: 0 | 1;
  label: string;
  probability: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PredictionListResponse {
  data: PredictionRecord[];
  pagination: Pagination;
}

/* ============================================================
   Auth payloads
   ============================================================ */

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

/* ============================================================
   API error
   ============================================================ */

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: { field: string; message: string }[];
}

/* ============================================================
   List filters
   ============================================================ */

export type ResultFilter = "all" | "diabetic" | "normal";

export interface PredictionListQuery {
  page?: number;
  limit?: number;
  result?: ResultFilter;
  date_from?: string;
  date_to?: string;
}
