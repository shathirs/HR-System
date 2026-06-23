import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { PayrollsService } from './payrolls.service';

@Controller('payrolls')
@UseGuards(JwtAuthGuard)
@ApiTags('Payrolls')
@ApiBearerAuth()
export class PayrollsController {
  constructor(private readonly payrollsService: PayrollsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreatePayrollDto) {
    return this.payrollsService.create(dto);
  }

  @Get()
  findAll() {
    return this.payrollsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdatePayrollDto) {
    return this.payrollsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.payrollsService.remove(id);
  }
}
