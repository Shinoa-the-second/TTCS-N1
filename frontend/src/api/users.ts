import { apiClient } from "./client";
import type { UserMe } from "@/types";

interface UpdateUserPayload {
  full_name?: string;
  date_of_birth?: string | null;
}

export const usersApi = {
  me: async (): Promise<UserMe> => {
    const res = await apiClient.get<UserMe>("/api/users/me");
    return res.data;
  },

  update: async (data: UpdateUserPayload): Promise<UserMe> => {
    const res = await apiClient.patch<UserMe>("/api/users/me", data);
    return res.data;
  },
};
