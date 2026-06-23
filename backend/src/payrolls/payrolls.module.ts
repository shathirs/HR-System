import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { EmployeesModule } from '../employees/employees.module';
import { Payroll } from './payroll.entity';
import { PayrollsController } from './payrolls.controller';
import { PayrollsService } from './payrolls.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payroll]),
    AuthModule,
    EmployeesModule,
  ],
  controllers: [PayrollsController],
  providers: [PayrollsService],
  exports: [PayrollsService],
})
export class PayrollsModule {}
