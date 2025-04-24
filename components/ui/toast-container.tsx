"use client";

import { Toast, type ToastProps, type ToastPosition } from "./toast";

interface ToastContainerProps {
  toasts: (Omit<ToastProps, "onClose"> & { position: ToastPosition })[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  // 위치별로 토스트 그룹화
  const groupedToasts = toasts.reduce<
    Record<ToastPosition, Omit<ToastProps, "onClose">[]>
  >(
    (acc, toast) => {
      if (!acc[toast.position]) {
        acc[toast.position] = [];
      }
      acc[toast.position].push(toast);
      return acc;
    },
    {
      "top-right": [],
      "top-left": [],
      "bottom-right": [],
      "bottom-left": [],
      "top-center": [],
      "bottom-center": [],
    }
  );

  // 위치별 컨테이너 클래스
  const getContainerClass = (position: ToastPosition) => {
    const baseClass = "toast-container fixed z-50 flex flex-col gap-2";

    switch (position) {
      case "top-right":
        return `${baseClass} top-4 right-4 items-end`;
      case "top-left":
        return `${baseClass} top-4 left-4 items-start`;
      case "bottom-right":
        return `${baseClass} bottom-4 right-4 items-end`;
      case "bottom-left":
        return `${baseClass} bottom-4 left-4 items-start`;
      case "top-center":
        return `${baseClass} top-4 left-1/2 -translate-x-1/2 items-center`;
      case "bottom-center":
        return `${baseClass} bottom-4 left-1/2 -translate-x-1/2 items-center`;
      default:
        return `${baseClass} bottom-4 right-4 items-end`;
    }
  };

  return (
    <>
      {Object.entries(groupedToasts).map(
        ([position, positionToasts]) =>
          positionToasts.length > 0 && (
            <div
              key={position}
              className={getContainerClass(position as ToastPosition)}
            >
              {positionToasts.map((toast) => (
                <Toast key={toast.id} {...toast} onClose={onClose} />
              ))}
            </div>
          )
      )}
    </>
  );
}
