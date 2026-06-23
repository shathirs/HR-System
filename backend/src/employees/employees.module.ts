import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DepartmentsModule } from '../departments/departments.module';
import { PositionsModule } from '../positions/positions.module';
import { EmployeeDocument } from './employee-document.entity';
import { Employee } from './employee.entity';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, EmployeeDocument]),
    AuthModule,
    DepartmentsModule,
    PositionsModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
