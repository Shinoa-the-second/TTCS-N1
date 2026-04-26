import { apiClient } from "./client";
import type {
  RegisterPayload,
  LoginPayload,
  TokenResponse,
  ChangePasswordPayload,
  User,
} from "@/types";

interface MessageResponse {
  message: string;
}

interface RegisterResponse {
  message: string;
  user: User;
}

export const authApi = {
  register: async (data: RegisterPayload) => {
    const res = await apiClient.post<RegisterResponse>(
      "/api/auth/register",
      data
    );
    return res.data;
  },

  login: async (data: LoginPayload) => {
    const res = await apiClient.post<TokenResponse>("/api/auth/login", data);
    return res.data;
  },

  logout: async (refreshToken: string) => {
    const res = await apiClient.post<MessageResponse>("/api/auth/logout", {
      refresh_token: refreshToken,
    });
    return res.data;
  },

  refresh: async (refreshToken: string) => {
    const res = await apiClient.post<{ access_token: string; expires_in: number }>(
      "/api/auth/refresh",
      { refresh_token: refreshToken }
    );
    return res.data;
  },

  changePassword: async (data: ChangePasswordPayload) => {
    const res = await apiClient.post<MessageResponse>(
      "/api/auth/change-password",
      data
    );
    return res.data;
  },
};
