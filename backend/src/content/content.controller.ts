import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/** Public, read-only endpoints that feed the dynamic website. */
@Controller('public')
export class PublicContentController {
  constructor(private readonly content: ContentService) {}

  @Get('site')
  site() {
    return this.content.getPublicSite();
  }

  @Get('settings')
  settings() {
    return this.content.getSettings();
  }

  @Get('services')
  services() {
    return this.content.listServices(true);
  }

  @Get('portfolio')
  portfolio() {
    return this.content.listPortfolio(true);
  }

  @Get('testimonials')
  testimonials() {
    return this.content.listTestimonials(true);
  }

  @Get('news')
  news() {
    return this.content.listNews(true);
  }

  @Get('news/:slug')
  newsItem(@Param('slug') slug: string) {
    return this.content.getNewsBySlug(slug);
  }

  @Get('team')
  team() {
    return this.content.listTeam(true);
  }
}

/** Admin-only CRUD endpoints. */
@UseGuards(JwtAuthGuard)
@Controller('admin/content')
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  // Settings
  @Get('settings')
  getSettings() {
    return this.content.getSettings();
  }
  @Put('settings')
  updateSettings(@Body() body: Record<string, unknown>) {
    return this.content.updateSettings(body);
  }

  // Services
  @Get('services')
  listServices() {
    return this.content.listServices(false);
  }
  @Post('services')
  createService(@Body() body: any) {
    return this.content.createService(body);
  }
  @Patch('services/:id')
  updateService(@Param('id') id: string, @Body() body: any) {
    return this.content.updateService(id, body);
  }
  @Delete('services/:id')
  deleteService(@Param('id') id: string) {
    return this.content.deleteService(id);
  }

  // Portfolio
  @Get('portfolio')
  listPortfolio() {
    return this.content.listPortfolio(false);
  }
  @Post('portfolio')
  createPortfolio(@Body() body: any) {
    return this.content.createPortfolio(body);
  }
  @Patch('portfolio/:id')
  updatePortfolio(@Param('id') id: string, @Body() body: any) {
    return this.content.updatePortfolio(id, body);
  }
  @Delete('portfolio/:id')
  deletePortfolio(@Param('id') id: string) {
    return this.content.deletePortfolio(id);
  }

  // Testimonials
  @Get('testimonials')
  listTestimonials() {
    return this.content.listTestimonials(false);
  }
  @Post('testimonials')
  createTestimonial(@Body() body: any) {
    return this.content.createTestimonial(body);
  }
  @Patch('testimonials/:id')
  updateTestimonial(@Param('id') id: string, @Body() body: any) {
    return this.content.updateTestimonial(id, body);
  }
  @Delete('testimonials/:id')
  deleteTestimonial(@Param('id') id: string) {
    return this.content.deleteTestimonial(id);
  }

  // News
  @Get('news')
  listNews() {
    return this.content.listNews(false);
  }
  @Post('news')
  createNews(@Body() body: any) {
    return this.content.createNews(body);
  }
  @Patch('news/:id')
  updateNews(@Param('id') id: string, @Body() body: any) {
    return this.content.updateNews(id, body);
  }
  @Delete('news/:id')
  deleteNews(@Param('id') id: string) {
    return this.content.deleteNews(id);
  }

  // Team
  @Get('team')
  listTeam() {
    return this.content.listTeam(false);
  }
  @Post('team')
  createTeam(@Body() body: any) {
    return this.content.createTeam(body);
  }
  @Patch('team/:id')
  updateTeam(@Param('id') id: string, @Body() body: any) {
    return this.content.updateTeam(id, body);
  }
  @Delete('team/:id')
  deleteTeam(@Param('id') id: string) {
    return this.content.deleteTeam(id);
  }
}
