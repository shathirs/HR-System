import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
