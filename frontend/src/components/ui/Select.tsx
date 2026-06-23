import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export default function Select({
  label,
  options,
  placeholder,
  error,
  id,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-body font-medium">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`rounded-md border border-secondary/30 px-3 py-2 text-body outline-none focus:border-primary ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
