import type { EmployeeStatus } from "./employee";
import type { PaymentStatus } from "./payroll";

export interface DashboardRecentEmployee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  status: EmployeeStatus;
  created_at: string;
}

export interface DashboardPendingPayroll {
  id: string;
  employee_id: string;
  employee_name: string | null;
  month: number;
  year: number;
  net_salary: number;
  payment_status: PaymentStatus;
}

export interface DashboardStats {
  total_employees: number;
  total_departments: number;
  total_positions: number;
  monthly_payroll_total: number;
  payroll_month: number;
  payroll_year: number;
  pending_payrolls_count: number;
  recent_employees: DashboardRecentEmployee[];
  pending_payrolls: DashboardPendingPayroll[];
}
