import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-body font-medium text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-lg border border-secondary/30 bg-white px-3 py-2 text-body outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
        {...props}
      />
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
