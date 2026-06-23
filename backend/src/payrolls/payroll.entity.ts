import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { PaymentStatus } from './payroll.constants';

@Entity('payrolls')
@Unique(['employeeId', 'month', 'year'])
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({
    name: 'basic_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  basicSalary: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  allowances: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  deductions: string;

  @Column({
    name: 'net_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  netSalary: string;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
