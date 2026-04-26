import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  items: Toast[];
}

const initialState: ToastState = { items: [] };

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    pushToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.items.push(action.payload);
      },
      prepare(payload: { message: string; type?: ToastType }) {
        return {
          payload: {
            id: nanoid(),
            message: payload.message,
            type: payload.type ?? "info",
          },
        };
      },
    },
    removeToast(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { pushToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
