import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../departments/department.entity';
import { Employee } from '../employees/employee.entity';
import { PaymentStatus } from '../payrolls/payroll.constants';
import { Payroll } from '../payrolls/payroll.entity';
import { Position } from '../positions/position.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
  ) {}

  async getStats() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [
      totalEmployees,
      totalDepartments,
      totalPositions,
      monthlyPayrolls,
      recentEmployees,
      pendingPayrollsCount,
      pendingPayrolls,
    ] = await Promise.all([
      this.employeeRepository.count(),
      this.departmentRepository.count(),
      this.positionRepository.count(),
      this.payrollRepository.find({ where: { month, year } }),
      this.employeeRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
      }),
      this.payrollRepository.count({
        where: { paymentStatus: PaymentStatus.PENDING },
      }),
      this.payrollRepository.find({
        where: { paymentStatus: PaymentStatus.PENDING },
        relations: { employee: true },
        order: { year: 'DESC', month: 'DESC', createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    const monthlyPayrollTotal = monthlyPayrolls.reduce(
      (sum, payroll) => sum + Number(payroll.netSalary),
      0,
    );

    return {
      total_employees: totalEmployees,
      total_departments: totalDepartments,
      total_positions: totalPositions,
      monthly_payroll_total: monthlyPayrollTotal,
      payroll_month: month,
      payroll_year: year,
      pending_payrolls_count: pendingPayrollsCount,
      recent_employees: recentEmployees.map((employee) => ({
        id: employee.id,
        employee_code: employee.employeeCode,
        first_name: employee.firstName,
        last_name: employee.lastName,
        email: employee.email,
        status: employee.status,
        created_at: employee.createdAt,
      })),
      pending_payrolls: pendingPayrolls.map((payroll) => ({
        id: payroll.id,
        employee_id: payroll.employeeId,
        employee_name: payroll.employee
          ? `${payroll.employee.firstName} ${payroll.employee.lastName}`
          : null,
        month: payroll.month,
        year: payroll.year,
        net_salary: Number(payroll.netSalary),
        payment_status: payroll.paymentStatus,
      })),
    };
  }
}
