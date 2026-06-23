import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(dto: CreateDepartmentDto) {
    const department = this.departmentRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      isActive: dto.is_active ?? true,
    });

    const saved = await this.departmentRepository.save(department);
    return this.formatDepartment(saved);
  }

  async findAll() {
    const departments = await this.departmentRepository.find({
      order: { createdAt: 'DESC' },
    });

    return departments.map((department) => this.formatDepartment(department));
  }

  async findOne(id: string) {
    const department = await this.getDepartmentOrFail(id);
    return this.formatDepartment(department);
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.getDepartmentOrFail(id);

    if (dto.name !== undefined) {
      department.name = dto.name;
    }

    if (dto.description !== undefined) {
      department.description = dto.description;
    }

    if (dto.is_active !== undefined) {
      department.isActive = dto.is_active;
    }

    const saved = await this.departmentRepository.save(department);
    return this.formatDepartment(saved);
  }

  async remove(id: string) {
    const department = await this.getDepartmentOrFail(id);
    await this.departmentRepository.remove(department);

    return { message: 'Department deleted successfully' };
  }

  private async getDepartmentOrFail(id: string) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }

    return department;
  }

  private formatDepartment(department: Department) {
    return {
      id: department.id,
      name: department.name,
      description: department.description,
      is_active: department.isActive,
      created_at: department.createdAt,
      updated_at: department.updatedAt,
    };
  }
}
