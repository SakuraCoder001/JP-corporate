import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { RagService } from './rag.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class IngestDto {
  @IsOptional() @IsString() title?: string;
  @IsString() @MinLength(1) content: string;
  @IsOptional() @IsString() source?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('admin/rag')
export class RagController {
  constructor(private readonly rag: RagService) {}

  @Get('documents')
  list() {
    return this.rag.listDocuments();
  }

  @Post('documents')
  ingest(@Body() dto: IngestDto) {
    return this.rag.ingest(dto.title || 'Untitled', dto.content, dto.source || 'manual');
  }

  @Delete('documents/:id')
  remove(@Param('id') id: string) {
    return this.rag.deleteDocument(id);
  }

  @Post('sync')
  syncFromCms() {
    return this.rag.syncFromCms();
  }
}
