import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tokenStorage } from "@/api/client";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const USER_KEY = "user";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: loadUser(),
  isAuthenticated: !!tokenStorage.getAccess(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        access_token: string;
        refresh_token?: string;
        user: User;
      }>
    ) {
      const { access_token, refresh_token, user } = action.payload;
      tokenStorage.set(access_token, refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      state.user = user;
      state.isAuthenticated = true;
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
    },
    logout(state) {
      tokenStorage.clear();
      localStorage.removeItem(USER_KEY);
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
