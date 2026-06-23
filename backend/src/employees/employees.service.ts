import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { createReadStream } from 'fs';
import { join, extname } from 'path';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { DepartmentsService } from '../departments/departments.service';
import { PositionsService } from '../positions/positions.service';
import { EmployeeDocument } from './employee-document.entity';
import { Employee } from './employee.entity';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  DocumentType,
  EmployeeStatus,
  EmploymentType,
  MAX_DOCUMENT_SIZE_BYTES,
} from './employee.constants';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  private readonly uploadRoot = join(process.cwd(), 'uploads', 'employees');

  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeDocument)
    private documentRepository: Repository<EmployeeDocument>,
    private departmentsService: DepartmentsService,
    private positionsService: PositionsService,
  ) {}

  async create(dto: CreateEmployeeDto) {
    await this.ensureDepartmentExists(dto.department_id);
    await this.ensurePositionExists(dto.position_id, dto.department_id);

    const existingEmployee = await this.employeeRepository.findOne({
      where: { email: dto.email },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee with this email already exists');
    }

    const employeeCode =
      dto.employee_code ?? (await this.generateEmployeeCode());

    const employee = this.employeeRepository.create({
      employeeCode,
      firstName: dto.first_name,
      lastName: dto.last_name,
      email: dto.email,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      departmentId: dto.department_id,
      positionId: dto.position_id,
      joiningDate: dto.joining_date,
      employmentType: dto.employment_type ?? EmploymentType.FULL_TIME,
      basicSalary: String(dto.basic_salary ?? 0),
      status: dto.status ?? EmployeeStatus.ONBOARDING,
    });

    const saved = await this.employeeRepository.save(employee);
    return this.formatEmployee(saved);
  }

  async findAll() {
    const employees = await this.employeeRepository.find({
      relations: { department: true, position: true },
      order: { createdAt: 'DESC' },
    });

    return employees.map((employee) => this.formatEmployee(employee));
  }

  async findOne(id: string) {
    const employee = await this.getEmployeeOrFail(id);
    return this.formatEmployee(employee);
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.getEmployeeOrFail(id);

    if (dto.department_id !== undefined) {
      await this.ensureDepartmentExists(dto.department_id);
      employee.departmentId = dto.department_id;
    }

    if (dto.position_id !== undefined) {
      const departmentId = dto.department_id ?? employee.departmentId;
      await this.ensurePositionExists(dto.position_id, departmentId);
      employee.positionId = dto.position_id;
    }

    if (dto.employee_code !== undefined) employee.employeeCode = dto.employee_code;
    if (dto.first_name !== undefined) employee.firstName = dto.first_name;
    if (dto.last_name !== undefined) employee.lastName = dto.last_name;
    if (dto.email !== undefined) employee.email = dto.email;
    if (dto.phone !== undefined) employee.phone = dto.phone;
    if (dto.address !== undefined) employee.address = dto.address;
    if (dto.joining_date !== undefined) employee.joiningDate = dto.joining_date;
    if (dto.employment_type !== undefined) {
      employee.employmentType = dto.employment_type;
    }
    if (dto.basic_salary !== undefined) {
      employee.basicSalary = String(dto.basic_salary);
    }
    if (dto.status !== undefined) employee.status = dto.status;

    const saved = await this.employeeRepository.save(employee);
    return this.formatEmployee(saved);
  }

  async remove(id: string) {
    const employee = await this.getEmployeeOrFail(id);
    const documents = await this.documentRepository.find({
      where: { employeeId: id },
    });

    for (const document of documents) {
      this.deleteFileIfExists(document.filePath);
    }

    await this.employeeRepository.remove(employee);
    return { message: 'Employee deleted successfully' };
  }

  async uploadDocument(
    employeeId: string,
    file: Express.Multer.File,
    documentType: DocumentType,
    uploadedBy: string,
  ) {
    await this.getEmployeeOrFail(employeeId);
    this.validateUploadedFile(file);

    const employeeDir = join(this.uploadRoot, employeeId);
    if (!existsSync(employeeDir)) {
      mkdirSync(employeeDir, { recursive: true });
    }

    const extension = extname(file.originalname).toLowerCase();
    const storedFileName = `${randomUUID()}${extension}`;
    const filePath = join(employeeDir, storedFileName);

    const document = this.documentRepository.create({
      employeeId,
      documentType,
      originalFileName: file.originalname,
      storedFileName,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy,
    });

    writeFileSync(filePath, file.buffer);

    const saved = await this.documentRepository.save(document);
    return this.formatDocument(saved);
  }

  async findDocuments(employeeId: string) {
    await this.getEmployeeOrFail(employeeId);

    const documents = await this.documentRepository.find({
      where: { employeeId },
      order: { uploadedAt: 'DESC' },
    });

    return documents.map((document) => this.formatDocument(document));
  }

  async getDocumentDownload(documentId: string) {
    const document = await this.getDocumentOrFail(documentId);

    if (!existsSync(document.filePath)) {
      throw new NotFoundException('Document file not found on server');
    }

    return {
      stream: createReadStream(document.filePath),
      document,
    };
  }

  async removeDocument(documentId: string) {
    const document = await this.getDocumentOrFail(documentId);
    this.deleteFileIfExists(document.filePath);
    await this.documentRepository.remove(document);

    return { message: 'Document deleted successfully' };
  }

  private validateUploadedFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException('File size must not exceed 5 MB');
    }

    if (
      !ALLOWED_DOCUMENT_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException(
        'Only PDF, JPG, JPEG, and PNG files are allowed',
      );
    }

    const extension = extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

    if (!allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        'Only PDF, JPG, JPEG, and PNG files are allowed',
      );
    }
  }

  private async generateEmployeeCode() {
    const count = await this.employeeRepository.count();
    return `EMP-${String(count + 1).padStart(4, '0')}`;
  }

  private async getEmployeeOrFail(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: { department: true, position: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    return employee;
  }

  private async getDocumentOrFail(documentId: string) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with id ${documentId} not found`);
    }

    return document;
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

  private async ensurePositionExists(positionId: string, departmentId: string) {
    try {
      const position = await this.positionsService.findOne(positionId);
      if (position.department_id !== departmentId) {
        throw new BadRequestException(
          'Position does not belong to the selected department',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Position with id ${positionId} not found`,
      );
    }
  }

  private deleteFileIfExists(filePath: string) {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  private formatEmployee(employee: Employee) {
    return {
      id: employee.id,
      employee_code: employee.employeeCode,
      first_name: employee.firstName,
      last_name: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      department_id: employee.departmentId,
      position_id: employee.positionId,
      joining_date: employee.joiningDate,
      employment_type: employee.employmentType,
      basic_salary: Number(employee.basicSalary),
      status: employee.status,
      created_at: employee.createdAt,
      updated_at: employee.updatedAt,
    };
  }

  private formatDocument(document: EmployeeDocument) {
    return {
      id: document.id,
      employee_id: document.employeeId,
      document_type: document.documentType,
      original_file_name: document.originalFileName,
      stored_file_name: document.storedFileName,
      file_path: document.filePath,
      file_size: document.fileSize,
      mime_type: document.mimeType,
      uploaded_by: document.uploadedBy,
      uploaded_at: document.uploadedAt,
    };
  }
}
