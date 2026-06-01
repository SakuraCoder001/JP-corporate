import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `post-${Date.now()}`;
}

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Site settings ----------
  async getSettings() {
    let settings = await this.prisma.siteSetting.findFirst();
    if (!settings) {
      settings = await this.prisma.siteSetting.create({ data: {} });
    }
    return settings;
  }

  async updateSettings(data: Record<string, unknown>) {
    const current = await this.getSettings();
    return this.prisma.siteSetting.update({ where: { id: current.id }, data });
  }

  // ---------- Services ----------
  listServices(onlyPublished = false) {
    return this.prisma.service.findMany({
      where: onlyPublished ? { published: true } : {},
      orderBy: { order: 'asc' },
    });
  }
  createService(data: any) {
    return this.prisma.service.create({ data });
  }
  async updateService(id: string, data: any) {
    await this.ensure('service', id);
    return this.prisma.service.update({ where: { id }, data });
  }
  async deleteService(id: string) {
    await this.ensure('service', id);
    return this.prisma.service.delete({ where: { id } });
  }

  // ---------- Portfolio ----------
  listPortfolio(onlyPublished = false) {
    return this.prisma.portfolioItem.findMany({
      where: onlyPublished ? { published: true } : {},
      orderBy: { order: 'asc' },
    });
  }
  createPortfolio(data: any) {
    return this.prisma.portfolioItem.create({ data });
  }
  async updatePortfolio(id: string, data: any) {
    await this.ensure('portfolioItem', id);
    return this.prisma.portfolioItem.update({ where: { id }, data });
  }
  async deletePortfolio(id: string) {
    await this.ensure('portfolioItem', id);
    return this.prisma.portfolioItem.delete({ where: { id } });
  }

  // ---------- Testimonials ----------
  listTestimonials(onlyPublished = false) {
    return this.prisma.testimonial.findMany({
      where: onlyPublished ? { published: true } : {},
      orderBy: { order: 'asc' },
    });
  }
  createTestimonial(data: any) {
    return this.prisma.testimonial.create({ data });
  }
  async updateTestimonial(id: string, data: any) {
    await this.ensure('testimonial', id);
    return this.prisma.testimonial.update({ where: { id }, data });
  }
  async deleteTestimonial(id: string) {
    await this.ensure('testimonial', id);
    return this.prisma.testimonial.delete({ where: { id } });
  }

  // ---------- News ----------
  listNews(onlyPublished = false) {
    return this.prisma.newsPost.findMany({
      where: onlyPublished ? { published: true } : {},
      orderBy: { publishedAt: 'desc' },
    });
  }
  getNewsBySlug(slug: string) {
    return this.prisma.newsPost.findUnique({ where: { slug } });
  }
  createNews(data: any) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.title || '');
    return this.prisma.newsPost.create({ data: { ...data, slug } });
  }
  async updateNews(id: string, data: any) {
    await this.ensure('newsPost', id);
    const patch = { ...data };
    if (patch.slug) patch.slug = slugify(patch.slug);
    return this.prisma.newsPost.update({ where: { id }, data: patch });
  }
  async deleteNews(id: string) {
    await this.ensure('newsPost', id);
    return this.prisma.newsPost.delete({ where: { id } });
  }

  // ---------- Team ----------
  listTeam(onlyPublished = false) {
    return this.prisma.teamMember.findMany({
      where: onlyPublished ? { published: true } : {},
      orderBy: { order: 'asc' },
    });
  }
  createTeam(data: any) {
    return this.prisma.teamMember.create({ data });
  }
  async updateTeam(id: string, data: any) {
    await this.ensure('teamMember', id);
    return this.prisma.teamMember.update({ where: { id }, data });
  }
  async deleteTeam(id: string) {
    await this.ensure('teamMember', id);
    return this.prisma.teamMember.delete({ where: { id } });
  }

  // ---------- Aggregate for the public site ----------
  async getPublicSite() {
    const [settings, services, portfolio, testimonials, news, team] = await Promise.all([
      this.getSettings(),
      this.listServices(true),
      this.listPortfolio(true),
      this.listTestimonials(true),
      this.listNews(true),
      this.listTeam(true),
    ]);
    return { settings, services, portfolio, testimonials, news, team };
  }

  private async ensure(model: 'service' | 'portfolioItem' | 'testimonial' | 'newsPost' | 'teamMember', id: string) {
    // @ts-expect-error dynamic model access
    const found = await this.prisma[model].findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException(`${model} ${id} not found`);
    }
  }
}
