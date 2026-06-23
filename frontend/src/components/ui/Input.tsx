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
        <label htmlFor={inputId} className="text-body font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-md border border-secondary/30 px-3 py-2 text-body outline-none focus:border-primary ${className}`}
        {...props}
      />
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
