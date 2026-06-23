import { api } from "./api";
import type {
  CreatePayrollPayload,
  Payroll,
  UpdatePayrollPayload,
} from "@/types/payroll";

export function getPayrolls() {
  return api<Payroll[]>("/payrolls");
}

export function getPayroll(id: string) {
  return api<Payroll>(`/payrolls/${id}`);
}

export function createPayroll(payload: CreatePayrollPayload) {
  return api<Payroll>("/payrolls", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePayroll(id: string, payload: UpdatePayrollPayload) {
  return api<Payroll>(`/payrolls/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deletePayroll(id: string) {
  return api<{ message: string }>(`/payrolls/${id}`, {
    method: "DELETE",
  });
}
