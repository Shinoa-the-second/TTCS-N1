import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import { predictionsApi } from "@/api/predictions";
import type { PredictionListQuery } from "@/types";

/* ============================================================
   Query keys — tập trung 1 chỗ để dễ invalidate
   ============================================================ */
export const queryKeys = {
  me: ["users", "me"] as const,
  predictions: (q: PredictionListQuery) => ["predictions", q] as const,
  prediction: (id: string) => ["predictions", id] as const,
};

/* ============================================================
   User
   ============================================================ */
export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: usersApi.me,
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.update,
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.me, data);
    },
  });
}

/* ============================================================
   Predictions
   ============================================================ */
export function usePredictionsQuery(query: PredictionListQuery) {
  return useQuery({
    queryKey: queryKeys.predictions(query),
    queryFn: () => predictionsApi.list(query),
    placeholderData: keepPreviousData, // smooth pagination
    staleTime: 10_000,
  });
}

export function usePredictionDetailQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.prediction(id ?? ""),
    queryFn: () => predictionsApi.detail(id!),
    enabled: !!id,
  });
}

export function useCreatePredictionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: predictionsApi.create,
    onSuccess: () => {
      // Mọi danh sách + me stats đều cần refresh
      qc.invalidateQueries({ queryKey: ["predictions"] });
      qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useDeletePredictionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: predictionsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["predictions"] });
      qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}
