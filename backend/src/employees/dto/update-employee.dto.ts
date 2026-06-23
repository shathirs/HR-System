import { EmployeeStatus, EmploymentType } from '../employee.constants';

export class UpdateEmployeeDto {
  employee_code?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  department_id?: string;
  position_id?: string;
  joining_date?: string;
  employment_type?: EmploymentType;
  basic_salary?: number;
  status?: EmployeeStatus;
}
