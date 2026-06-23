import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from '../departments/department.entity';
import { Position } from '../positions/position.entity';
import { EmployeeDocument } from './employee-document.entity';
import { EmployeeStatus, EmploymentType } from './employee.constants';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_code', unique: true })
  employeeCode: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'department_id' })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'position_id' })
  positionId: string;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @Column({ name: 'joining_date', type: 'date' })
  joiningDate: string;

  @Column({
    name: 'employment_type',
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  @Column({
    name: 'basic_salary',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  basicSalary: string;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ONBOARDING,
  })
  status: EmployeeStatus;

  @OneToMany(() => EmployeeDocument, (document) => document.employee)
  documents: EmployeeDocument[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
