import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-secondary/20 bg-white p-6 shadow-sm ${className}`}
    >
      {title && <h3 className="mb-4 text-subheading font-semibold">{title}</h3>}
      {children}
    </div>
  );
}
