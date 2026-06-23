import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Department } from '../departments/department.entity';
import { Employee } from '../employees/employee.entity';
import { Payroll } from '../payrolls/payroll.entity';
import { Position } from '../positions/position.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Department, Position, Payroll]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
