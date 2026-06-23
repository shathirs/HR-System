type StatusVariant = "success" | "warning" | "danger" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-surface text-secondary",
};

export default function StatusBadge({
  label,
  variant = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-caption font-medium ${variantStyles[variant]}`}
    >
      {label}
    </span>
  );
}
