"use client";

import { useEffect } from "react";

type ToastVariant = "success" | "error" | "warning";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "border-success/30 bg-white text-success",
  error: "border-danger/30 bg-white text-danger",
  warning: "border-warning/30 bg-white text-warning",
};

export default function Toast({
  message,
  variant = "success",
  duration = 2000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      className="fixed left-1/2 top-6 z-50 w-full max-w-sm -translate-x-1/2 px-4"
    >
      <div
        className={`rounded-lg border px-4 py-3 text-center text-body font-medium shadow-lg ${variantStyles[variant]}`}
      >
        {message}
      </div>
    </div>
  );
}
