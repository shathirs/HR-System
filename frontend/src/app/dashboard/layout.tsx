import type { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthGuard from "@/components/layout/AuthGuard";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}