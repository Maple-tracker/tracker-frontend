"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ToastContainer } from "@/components/ui/toast-container";
import type { ToastType, ToastPosition } from "@/components/ui/toast";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  position: ToastPosition;
}

interface ToastContextType {
  showToast: (
    message: string,
    type: ToastType,
    options?: { duration?: number; position?: ToastPosition }
  ) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: ToastType,
    options?: { duration?: number; position?: ToastPosition }
  ) => {
    const id = Date.now().toString();
    const position = options?.position || "bottom-right";
    const duration = options?.duration || 5000;

    setToasts((prev) => [...prev, { id, message, type, duration, position }]);
    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
