import { apiClient } from "./client";
import type {
  DiabetesInput,
  PredictionListQuery,
  PredictionListResponse,
  PredictionRecord,
} from "@/types";

interface CreatePredictionPayload {
  input_data: DiabetesInput;
  prediction: 0 | 1;
  label: string;
  probability: number;
}

interface CreatePredictionResponse {
  id: string;
  user_id: string;
  created_at: string;
  message: string;
}

export const predictionsApi = {
  create: async (data: CreatePredictionPayload) => {
    const res = await apiClient.post<CreatePredictionResponse>(
      "/api/predictions",
      data
    );
    return res.data;
  },

  list: async (query: PredictionListQuery = {}) => {
    const res = await apiClient.get<PredictionListResponse>("/api/predictions", {
      params: query,
    });
    return res.data;
  },

  detail: async (id: string) => {
    const res = await apiClient.get<PredictionRecord>(`/api/predictions/${id}`);
    return res.data;
  },

  remove: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(
      `/api/predictions/${id}`
    );
    return res.data;
  },
};
