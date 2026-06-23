export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface Payroll {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePayrollPayload {
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances?: number;
  deductions?: number;
  payment_status?: PaymentStatus;
}

export interface UpdatePayrollPayload extends Partial<CreatePayrollPayload> {}

export const PAYMENT_STATUS_OPTIONS: {
  label: string;
  value: PaymentStatus;
}[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Failed", value: "FAILED" },
];

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  label: new Date(2000, index, 1).toLocaleString("en-US", { month: "long" }),
  value: String(index + 1),
}));
