/**
 * Re-index CMS content (team, CEO, services, etc.) into the RAG vector store.
 * Requires rag-service running: npm run dev:rag
 */
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const RAG_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';
const CMS_SYNC_SOURCE = 'cms-sync';
const CMS_SYNC_TITLE = '会社ナレッジベース（CMS自動同期）';

async function buildCmsKnowledgeText(): Promise<string> {
  const [settings, services, team] = await Promise.all([
    prisma.siteSetting.findFirst(),
    prisma.service.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    prisma.teamMember.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
  ]);
  const lines: string[] = [];
  if (settings) {
    lines.push(`# ${settings.companyName}`, settings.aboutBody);
  }
  if (team.length) {
    lines.push('\n## チーム・役員');
    for (const m of team) lines.push(`- ${m.name}（${m.role}）: ${m.bio || ''}`);
    const ceo = team.find((m) => m.role.includes('CEO') || m.role.includes('代表'));
    if (ceo) {
      lines.push('\n### 代表取締役・CEO', `氏名: ${ceo.name}`, `役職: ${ceo.role}`, `プロフィール: ${ceo.bio}`);
    }
  }
  if (services.length) {
    lines.push('\n## サービス');
    for (const s of services) lines.push(`- ${s.title}: ${s.description}`);
  }
  return lines.join('\n');
}

async function main() {
  const content = await buildCmsKnowledgeText();
  const existing = await prisma.ragDocument.findMany({ where: { source: CMS_SYNC_SOURCE } });
  for (const doc of existing) {
    try {
      await axios.delete(`${RAG_URL}/documents/${doc.id}`);
    } catch {
      /* ignore */
    }
    await prisma.ragDocument.delete({ where: { id: doc.id } }).catch(() => undefined);
  }
  const record = await prisma.ragDocument.create({
    data: { title: CMS_SYNC_TITLE, content, source: CMS_SYNC_SOURCE },
  });
  const res = await axios.post(`${RAG_URL}/ingest`, { document_id: record.id, content });
  const chunks = res.data?.chunks ?? 0;
  await prisma.ragDocument.update({ where: { id: record.id }, data: { chunks } });
  console.log(`RAG sync OK: ${chunks} chunks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
