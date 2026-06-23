import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MAX_DOCUMENT_SIZE_BYTES } from './employee.constants';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UploadEmployeeDocumentDto } from './dto/upload-employee-document.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
@UseGuards(JwtAuthGuard)
@ApiTags('Employees')
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get('documents/:documentId/download')
  async downloadDocument(
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    const { stream, document } =
      await this.employeesService.getDocumentDownload(documentId);

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.originalFileName}"`,
    );

    stream.pipe(res);
  }

  @Delete('documents/:documentId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  removeDocument(@Param('documentId') documentId: string) {
    return this.employeesService.removeDocument(documentId);
  }

  @Post(':id/documents')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        document_type: { type: 'string' },
      },
      required: ['file', 'document_type'],
    },
  })
  uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadEmployeeDocumentDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.employeesService.uploadDocument(
      id,
      file,
      dto.document_type,
      req.user.userId,
    );
  }

  @Get(':id/documents')
  findDocuments(@Param('id') id: string) {
    return this.employeesService.findDocuments(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
