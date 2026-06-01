import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';

const prisma = new PrismaClient();
const RAG_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';
const CMS_SYNC_SOURCE = 'cms-sync';
const CMS_SYNC_TITLE = '会社ナレッジベース（CMS自動同期）';

async function ensurePgvector() {
  // Make sure the vector extension and embeddings table exist even when the
  // project is bootstrapped with `prisma db push` (which ignores raw SQL
  // migrations).
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS rag_embeddings (
      id          BIGSERIAL PRIMARY KEY,
      document_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL DEFAULT 0,
      content     TEXT NOT NULL,
      embedding   VECTOR(384) NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS rag_embeddings_document_id_idx ON rag_embeddings (document_id);',
  );
  try {
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS rag_embeddings_embedding_idx ON rag_embeddings USING hnsw (embedding vector_cosine_ops);',
    );
  } catch (e) {
    console.warn('Could not create HNSW index (will fall back to sequential scan):', (e as Error).message);
  }
}

async function main() {
  console.log('Seeding database...');

  await ensurePgvector();

  // --- Admin ---
  const email = process.env.ADMIN_EMAIL || 'admin@jp-corporate.local';
  const password = process.env.ADMIN_PASSWORD || 'admin1234';
  const hashed = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, password: hashed, name: 'Administrator' },
  });
  console.log(`Admin ready: ${email} / ${password}`);

  // --- Site settings ---
  const existingSettings = await prisma.siteSetting.findFirst();
  if (!existingSettings) {
    await prisma.siteSetting.create({
      data: {
        companyName: 'Sakura Tech',
        tagline: '未来を創るITソリューション',
        heroTitle: 'テクノロジーで、明日をもっと明るく。',
        heroSubtitle:
          '私たちは、お客様のビジネスを次のステージへ導くクラウド・AI・Web開発のパートナーです。',
        heroImageUrl: '',
        aboutTitle: '私たちについて',
        aboutBody:
          'Sakura Techは、東京を拠点とするITソリューション企業です。クラウド構築、AI導入、Webアプリケーション開発を通じて、企業のデジタル変革を支援しています。',
        email: 'contact@sakuratech.jp',
        phone: '03-1234-5678',
        address: '東京都千代田区丸の内1-1-1',
        accentColor: '#2563eb',
        socialLinks: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' },
        stats: [
          { label: '導入実績', value: 320, suffix: '+' },
          { label: 'お客様満足度', value: 98, suffix: '%' },
          { label: '稼働年数', value: 12, suffix: '年' },
          { label: 'エンジニア', value: 64, suffix: '名' },
        ],
      },
    });
  }

  // --- Services ---
  if ((await prisma.service.count()) === 0) {
    await prisma.service.createMany({
      data: [
        { title: 'クラウド構築', description: 'AWS・Azure・GCP を活用したスケーラブルなインフラ設計と運用。', icon: 'cloud', order: 1 },
        { title: 'AI / 機械学習', description: '生成AI・RAG・予測モデルの導入で業務を自動化・効率化します。', icon: 'cpu', order: 2 },
        { title: 'Web開発', description: 'モダンなフロントエンドとAPIで高速で美しいWebサービスをUX重視で。', icon: 'code', order: 3 },
        { title: 'DXコンサルティング', description: '戦略立案から実装まで、デジタル変革を一気通貫で支援します。', icon: 'compass', order: 4 },
      ],
    });
  }

  // --- Portfolio ---
  if ((await prisma.portfolioItem.count()) === 0) {
    await prisma.portfolioItem.createMany({
      data: [
        { title: 'ECプラットフォーム刷新', client: '大手小売A社', category: 'Web開発', description: '月間1000万PVのECサイトをNext.jsで再構築し、表示速度を3倍に改善。', order: 1 },
        { title: 'AIチャットサポート導入', client: '金融B社', category: 'AI', description: 'RAGベースの問い合わせ対応AIを導入し、対応工数を40%削減。', order: 2 },
        { title: 'クラウド移行', client: '製造C社', category: 'クラウド', description: 'オンプレミス基盤をAWSへ移行し、運用コストを30%削減。', order: 3 },
      ],
    });
  }

  // --- Testimonials ---
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: [
        { authorName: '田中 太郎', authorRole: 'CTO', company: '株式会社アルファ', quote: '提案から運用まで非常にスピーディーで、期待以上の成果を出していただきました。', rating: 5, order: 1 },
        { authorName: '佐藤 花子', authorRole: 'マーケティング部長', company: 'ベータ商事', quote: 'AIチャットの導入で顧客対応が大きく改善しました。頼れるパートナーです。', rating: 5, order: 2 },
        { authorName: '鈴木 一郎', authorRole: '代表取締役', company: 'ガンマ工業', quote: 'クラウド移行のおかげでコストも工数も削減でき、大変満足しています。', rating: 5, order: 3 },
      ],
    });
  }

  // --- News ---
  if ((await prisma.newsPost.count()) === 0) {
    await prisma.newsPost.createMany({
      data: [
        { title: '新サービス「Sakura AI」をリリースしました', slug: 'release-sakura-ai', excerpt: '企業向け生成AIプラットフォームの提供を開始。', body: '本日、企業向け生成AIプラットフォーム「Sakura AI」の提供を開始しました。RAGによる社内ナレッジ活用が可能です。', category: 'プレスリリース' },
        { title: '東京オフィスを移転しました', slug: 'office-relocation', excerpt: '事業拡大に伴い、より広いオフィスへ移転。', body: '事業拡大に伴い、東京オフィスを丸の内へ移転いたしました。', category: 'お知らせ' },
        { title: 'AWS パートナー認定を取得', slug: 'aws-partner', excerpt: 'AWSの技術パートナー認定を取得しました。', body: 'この度、AWSアドバンストティアサービスパートナーの認定を取得いたしました。', category: 'ニュース' },
      ],
    });
  }

  // --- Team ---
  if ((await prisma.teamMember.count()) === 0) {
    await prisma.teamMember.createMany({
      data: [
        { name: '山田 健太', role: '代表取締役 CEO', bio: '15年以上のIT業界経験を持つ起業家。', order: 1 },
        { name: '中村 美咲', role: 'CTO', bio: 'クラウドとAIのスペシャリスト。', order: 2 },
        { name: '小林 大輔', role: 'リードエンジニア', bio: 'フルスタック開発を牽引。', order: 3 },
      ],
    });
  }

  await syncCmsToRag();
  console.log('Seeding complete.');
}

async function buildCmsKnowledgeText(): Promise<string> {
  const [settings, services, portfolio, testimonials, news, team] = await Promise.all([
    prisma.siteSetting.findFirst(),
    prisma.service.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    prisma.portfolioItem.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    prisma.newsPost.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' } }),
    prisma.teamMember.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
  ]);

  const lines: string[] = [];
  if (settings) {
    lines.push(`# ${settings.companyName}`, settings.tagline, `## ${settings.aboutTitle}`, settings.aboutBody);
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

async function syncCmsToRag() {
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
  try {
    const res = await axios.post(`${RAG_URL}/ingest`, { document_id: record.id, content });
    const chunks = res.data?.chunks ?? 0;
    await prisma.ragDocument.update({ where: { id: record.id }, data: { chunks } });
    console.log(`RAG knowledge synced (${chunks} chunks). Start rag-service if this was 0.`);
  } catch (e) {
    console.warn(
      `RAG ingest skipped (is rag-service running on ${RAG_URL}?): ${(e as Error).message}`,
    );
    console.warn('Run: npm run dev — then Admin → ナレッジ → 「CMSから再同期」');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
