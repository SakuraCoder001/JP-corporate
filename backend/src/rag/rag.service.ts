import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

const RAG_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';
const CMS_SYNC_SOURCE = 'cms-sync';
const CMS_SYNC_TITLE = '会社ナレッジベース（CMS自動同期）';

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // After RAG service boots, index CMS content so the chatbot knows team/CEO/etc.
    const delay = Number(process.env.RAG_SYNC_DELAY_MS || 8000);
    setTimeout(() => {
      this.syncFromCms().catch((e) =>
        this.logger.warn(`Startup CMS→RAG sync skipped: ${(e as Error).message}`),
      );
    }, delay);
  }

  async listDocuments() {
    return this.prisma.ragDocument.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async ingest(title: string, content: string, source = 'manual') {
    const doc = await this.prisma.ragDocument.create({
      data: { title: title || 'Untitled', content, source },
    });

    try {
      const res = await axios.post(`${RAG_URL}/ingest`, {
        document_id: doc.id,
        content,
      });
      const chunks = res.data?.chunks ?? 0;
      await this.prisma.ragDocument.update({ where: { id: doc.id }, data: { chunks } });
      return { ...doc, chunks };
    } catch (e) {
      this.logger.error(`RAG ingest failed: ${(e as Error).message}`);
      return { ...doc, chunks: 0, warning: 'RAG service unavailable; embeddings not created.' };
    }
  }

  async deleteDocument(id: string) {
    await this.prisma.ragDocument.delete({ where: { id } }).catch(() => undefined);
    try {
      await axios.delete(`${RAG_URL}/documents/${id}`);
    } catch (e) {
      this.logger.warn(`RAG delete failed: ${(e as Error).message}`);
    }
    return { ok: true };
  }

  /** Build searchable text from all published CMS content (team, services, etc.). */
  async buildCmsKnowledgeText(): Promise<string> {
    const [settings, services, portfolio, testimonials, news, team] = await Promise.all([
      this.prisma.siteSetting.findFirst(),
      this.prisma.service.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
      this.prisma.portfolioItem.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
      this.prisma.testimonial.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
      this.prisma.newsPost.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' } }),
      this.prisma.teamMember.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    ]);

    const lines: string[] = [];
    if (settings) {
      lines.push(`# ${settings.companyName}`);
      lines.push(settings.tagline);
      lines.push(`## ${settings.aboutTitle}`);
      lines.push(settings.aboutBody);
      lines.push(`連絡先: ${settings.email} / ${settings.phone} / ${settings.address}`);
    }

    if (team.length) {
      lines.push('\n## チーム・役員');
      for (const m of team) {
        lines.push(`- ${m.name}（${m.role}）: ${m.bio || '（紹介なし）'}`);
      }
      const ceo = team.find(
        (m) => m.role.includes('CEO') || m.role.includes('代表') || m.role.includes('社長'),
      );
      if (ceo) {
        lines.push(`\n### 代表取締役・CEO`);
        lines.push(`氏名: ${ceo.name}`);
        lines.push(`役職: ${ceo.role}`);
        lines.push(`プロフィール: ${ceo.bio}`);
      }
    }

    if (services.length) {
      lines.push('\n## サービス');
      for (const s of services) {
        lines.push(`- ${s.title}: ${s.description}`);
      }
    }

    if (portfolio.length) {
      lines.push('\n## 実績');
      for (const p of portfolio) {
        lines.push(`- ${p.title}（${p.client}）: ${p.description}`);
      }
    }

    if (testimonials.length) {
      lines.push('\n## お客様の声');
      for (const t of testimonials) {
        lines.push(`- ${t.authorName}（${t.company}）: ${t.quote}`);
      }
    }

    if (news.length) {
      lines.push('\n## ニュース');
      for (const n of news) {
        lines.push(`- ${n.title}: ${n.excerpt || n.body.slice(0, 200)}`);
      }
    }

    return lines.join('\n');
  }

  /** Re-index all CMS content into the RAG vector store. */
  async syncFromCms() {
    const content = await this.buildCmsKnowledgeText();
    const existing = await this.prisma.ragDocument.findMany({ where: { source: CMS_SYNC_SOURCE } });
    for (const doc of existing) {
      await this.deleteDocument(doc.id);
    }
    const result = await this.ingest(CMS_SYNC_TITLE, content, CMS_SYNC_SOURCE);
    this.logger.log(`CMS knowledge synced (${result.chunks ?? 0} chunks)`);
    return result;
  }

  async retrieveContext(query: string, topK = 8): Promise<string> {
    try {
      const res = await axios.post(`${RAG_URL}/query`, { query, top_k: topK });
      const results: Array<{ content: string; score?: number }> = res.data?.results ?? [];
      if (results.length === 0) {
        this.logger.warn('RAG query returned no results');
        return '';
      }
      return results.map((r) => r.content).join('\n---\n');
    } catch (e) {
      this.logger.warn(`RAG query failed: ${(e as Error).message}`);
      return '';
    }
  }
}
