import { aiClient } from "./client";
import type { DiabetesInput, AIPredictResponse } from "@/types";

export const aiApi = {
  predict: async (input: DiabetesInput): Promise<AIPredictResponse> => {
    const res = await aiClient.post<AIPredictResponse>("/predict", input);
    return res.data;
  },

  health: async () => {
    const res = await aiClient.get("/health");
    return res.data;
  },
};
