import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DepartmentsModule } from '../departments/departments.module';
import { Position } from './position.entity';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position]),
    AuthModule,
    DepartmentsModule,
  ],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}
