import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PayrollsModule } from './payrolls/payrolls.module';
import { PositionsModule } from './positions/positions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true,}),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      migrations: [`${__dirname}/database/migrations/*{.ts,.js}`],
      migrationsRun: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    UsersModule,
    AuthModule,
    DepartmentsModule,
    PositionsModule,
    EmployeesModule,
    PayrollsModule,
    DashboardModule,
  ]
})

export class AppModule {}
