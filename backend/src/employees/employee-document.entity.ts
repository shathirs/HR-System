import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { DocumentType } from './employee.constants';

@Entity('employee_documents')
export class EmployeeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee, (employee) => employee.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  documentType: DocumentType;

  @Column({ name: 'original_file_name' })
  originalFileName: string;

  @Column({ name: 'stored_file_name' })
  storedFileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamp' })
  uploadedAt: Date;
}
