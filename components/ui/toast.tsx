"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  position?: ToastPosition;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  message,
  type,
  duration = 5000,
  position = "top-center",
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;

      if (remaining <= 0) {
        clearInterval(timer);
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // 애니메이션 후 제거
      } else {
        setProgress(newProgress);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getToastClasses = () => {
    const baseClasses =
      "toast-item flex items-center p-4 rounded-md shadow-lg max-w-md w-full transform transition-all duration-300";
    const visibilityClasses = isVisible
      ? "translate-y-0 opacity-100"
      : "translate-y-2 opacity-0";

    let typeClasses = "";
    switch (type) {
      case "success":
        typeClasses = "bg-green-900/80 border-l-4 border-green-500";
        break;
      case "error":
        typeClasses = "bg-red-900/80 border-l-4 border-red-500";
        break;
      case "warning":
        typeClasses = "bg-yellow-900/80 border-l-4 border-yellow-500";
        break;
      case "info":
      default:
        typeClasses = "bg-blue-900/80 border-l-4 border-blue-500";
        break;
    }

    return `${baseClasses} ${typeClasses} ${visibilityClasses}`;
  };

  return (
    <div className={getToastClasses()}>
      <div className="flex-shrink-0 mr-3">{getIcon()}</div>
      <div className="flex-1 mr-2">
        <p className="text-sm text-white">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="toast-progress-bar"
        style={{
          width: `${progress}%`,
          backgroundColor:
            type === "success"
              ? "#10B981"
              : type === "error"
              ? "#EF4444"
              : type === "warning"
              ? "#F59E0B"
              : "#3B82F6",
        }}
      />
    </div>
  );
}
