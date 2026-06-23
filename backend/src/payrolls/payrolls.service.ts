import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeesService } from '../employees/employees.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { PaymentStatus } from './payroll.constants';
import { Payroll } from './payroll.entity';

@Injectable()
export class PayrollsService {
  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    private employeesService: EmployeesService,
  ) {}

  async create(dto: CreatePayrollDto) {
    await this.ensureEmployeeExists(dto.employee_id);
    this.validatePeriod(dto.month, dto.year);
    await this.ensurePayrollPeriodIsUnique(
      dto.employee_id,
      dto.month,
      dto.year,
    );

    const basicSalary = dto.basic_salary ?? 0;
    const allowances = dto.allowances ?? 0;
    const deductions = dto.deductions ?? 0;

    const payroll = this.payrollRepository.create({
      employeeId: dto.employee_id,
      month: dto.month,
      year: dto.year,
      basicSalary: String(basicSalary),
      allowances: String(allowances),
      deductions: String(deductions),
      netSalary: String(this.calculateNetSalary(basicSalary, allowances, deductions)),
      paymentStatus: dto.payment_status ?? PaymentStatus.PENDING,
    });

    const saved = await this.payrollRepository.save(payroll);
    return this.formatPayroll(saved);
  }

  async findAll() {
    const payrolls = await this.payrollRepository.find({
      relations: { employee: true },
      order: { year: 'DESC', month: 'DESC', createdAt: 'DESC' },
    });

    return payrolls.map((payroll) => this.formatPayroll(payroll));
  }

  async findOne(id: string) {
    const payroll = await this.getPayrollOrFail(id);
    return this.formatPayroll(payroll);
  }

  async update(id: string, dto: UpdatePayrollDto) {
    const payroll = await this.getPayrollOrFail(id);

    const employeeId = dto.employee_id ?? payroll.employeeId;
    const month = dto.month ?? payroll.month;
    const year = dto.year ?? payroll.year;

    if (dto.employee_id !== undefined) {
      await this.ensureEmployeeExists(dto.employee_id);
      payroll.employeeId = dto.employee_id;
    }

    if (dto.month !== undefined || dto.year !== undefined) {
      this.validatePeriod(month, year);
      await this.ensurePayrollPeriodIsUnique(employeeId, month, year, id);
      payroll.month = month;
      payroll.year = year;
    }

    if (dto.basic_salary !== undefined) {
      payroll.basicSalary = String(dto.basic_salary);
    }

    if (dto.allowances !== undefined) {
      payroll.allowances = String(dto.allowances);
    }

    if (dto.deductions !== undefined) {
      payroll.deductions = String(dto.deductions);
    }

    if (dto.payment_status !== undefined) {
      payroll.paymentStatus = dto.payment_status;
    }

    payroll.netSalary = String(
      this.calculateNetSalary(
        Number(payroll.basicSalary),
        Number(payroll.allowances),
        Number(payroll.deductions),
      ),
    );

    const saved = await this.payrollRepository.save(payroll);
    return this.formatPayroll(saved);
  }

  async remove(id: string) {
    const payroll = await this.getPayrollOrFail(id);
    await this.payrollRepository.remove(payroll);

    return { message: 'Payroll deleted successfully' };
  }

  private calculateNetSalary(
    basicSalary: number,
    allowances: number,
    deductions: number,
  ) {
    return basicSalary + allowances - deductions;
  }

  private validatePeriod(month: number, year: number) {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }

    if (year < 2000 || year > 2100) {
      throw new BadRequestException('Year must be between 2000 and 2100');
    }
  }

  private async ensurePayrollPeriodIsUnique(
    employeeId: string,
    month: number,
    year: number,
    excludeId?: string,
  ) {
    const existing = await this.payrollRepository.findOne({
      where: { employeeId, month, year },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        'Payroll record already exists for this employee, month, and year',
      );
    }
  }

  private async ensureEmployeeExists(employeeId: string) {
    try {
      await this.employeesService.findOne(employeeId);
    } catch {
      throw new BadRequestException(
        `Employee with id ${employeeId} not found`,
      );
    }
  }

  private async getPayrollOrFail(id: string) {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with id ${id} not found`);
    }

    return payroll;
  }

  private formatPayroll(payroll: Payroll) {
    return {
      id: payroll.id,
      employee_id: payroll.employeeId,
      month: payroll.month,
      year: payroll.year,
      basic_salary: Number(payroll.basicSalary),
      allowances: Number(payroll.allowances),
      deductions: Number(payroll.deductions),
      net_salary: Number(payroll.netSalary),
      payment_status: payroll.paymentStatus,
      created_at: payroll.createdAt,
      updated_at: payroll.updatedAt,
    };
  }
}
