import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentsService } from '../departments/departments.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Position } from './position.entity';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    private departmentsService: DepartmentsService,
  ) {}

  async create(dto: CreatePositionDto) {
    await this.ensureDepartmentExists(dto.department_id);

    const position = this.positionRepository.create({
      departmentId: dto.department_id,
      title: dto.title,
      description: dto.description ?? null,
      isActive: dto.is_active ?? true,
    });

    const saved = await this.positionRepository.save(position);
    return this.formatPosition(saved);
  }

  async findAll() {
    const positions = await this.positionRepository.find({
      relations: { department: true },
      order: { createdAt: 'DESC' },
    });

    return positions.map((position) => this.formatPosition(position));
  }

  async findOne(id: string) {
    const position = await this.getPositionOrFail(id);
    return this.formatPosition(position);
  }

  async update(id: string, dto: UpdatePositionDto) {
    const position = await this.getPositionOrFail(id);

    if (dto.department_id !== undefined) {
      await this.ensureDepartmentExists(dto.department_id);
      position.departmentId = dto.department_id;
    }

    if (dto.title !== undefined) {
      position.title = dto.title;
    }

    if (dto.description !== undefined) {
      position.description = dto.description;
    }

    if (dto.is_active !== undefined) {
      position.isActive = dto.is_active;
    }

    const saved = await this.positionRepository.save(position);
    return this.formatPosition(saved);
  }

  async remove(id: string) {
    const position = await this.getPositionOrFail(id);
    await this.positionRepository.remove(position);

    return { message: 'Position deleted successfully' };
  }

  private async getPositionOrFail(id: string) {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: { department: true },
    });

    if (!position) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    return position;
  }

  private async ensureDepartmentExists(departmentId: string) {
    try {
      await this.departmentsService.findOne(departmentId);
    } catch {
      throw new BadRequestException(
        `Department with id ${departmentId} not found`,
      );
    }
  }

  private formatPosition(position: Position) {
    return {
      id: position.id,
      department_id: position.departmentId,
      title: position.title,
      description: position.description,
      is_active: position.isActive,
      created_at: position.createdAt,
      updated_at: position.updatedAt,
    };
  }
}
