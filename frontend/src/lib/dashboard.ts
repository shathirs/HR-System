import { api } from "./api";
import type { DashboardStats } from "@/types/dashboard";

export function getDashboardStats() {
  return api<DashboardStats>("/dashboard");
}
