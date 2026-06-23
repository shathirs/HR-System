import { PaymentStatus } from '../payroll.constants';

export class UpdatePayrollDto {
  employee_id?: string;
  month?: number;
  year?: number;
  basic_salary?: number;
  allowances?: number;
  deductions?: number;
  payment_status?: PaymentStatus;
}
