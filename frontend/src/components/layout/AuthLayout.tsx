import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface p-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary/5" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-subheading font-bold text-white shadow-md">
            HR
          </div>
          <h1 className="text-heading font-bold text-primary">{title}</h1>
          <p className="mt-2 text-body text-secondary">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-secondary/10 bg-white p-8 shadow-xl">
          {children}
        </div>

        <div className="mt-6 text-center text-body text-secondary">{footer}</div>
      </div>
    </div>
  );
}
