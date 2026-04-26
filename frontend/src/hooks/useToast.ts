import { useAppDispatch } from "@/store";
import { pushToast, ToastType } from "@/store/toastSlice";
import { useCallback } from "react";

/** Shortcut: const toast = useToast(); toast("Đã lưu", "success"); */
export function useToast() {
  const dispatch = useAppDispatch();
  return useCallback(
    (message: string, type: ToastType = "info") => {
      dispatch(pushToast({ message, type }));
    },
    [dispatch]
  );
}
