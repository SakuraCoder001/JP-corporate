import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { RagService } from '../rag/rag.service';
import { EventsGateway } from '../events/events.gateway';

const SYSTEM_PROMPT = `あなたは日本のIT企業の親切なカスタマーサポートAIアシスタントです。
会社のサービス（クラウド構築、AI/機械学習、Web開発、DXコンサルティング）について、
提供された参考情報（コンテキスト）に基づいて、丁寧で分かりやすい日本語で回答してください。
コンテキストに答えがない場合は、無理に作らず、お問い合わせフォームへの連絡を案内してください。`;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rag: RagService,
    private readonly events: EventsGateway,
  ) {
    const apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
      });
    } else {
      this.client = null;
      this.logger.warn('GROQ_API_KEY not set; chat will return a placeholder response.');
    }
  }

  async startConversation(visitorIp = '', sessionId?: string) {
    return this.prisma.chatConversation.create({
      data: { visitorIp, sessionId: sessionId || null },
    });
  }

  async getConversation(id: string) {
    return this.prisma.chatConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async listConversations() {
    return this.prisma.chatConversation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async sendMessage(conversationId: string, userText: string) {
    // Persist + broadcast the user's message immediately.
    const userMsg = await this.prisma.chatMessage.create({
      data: { conversationId, role: 'user', content: userText },
    });
    this.events.emitChatMessage(conversationId, userMsg);

    let context = await this.rag.retrieveContext(userText, 8);
    if (!context || context.length < 80) {
      const cms = await this.rag.buildCmsKnowledgeText();
      context = context ? `${context}\n---\n${cms}` : cms;
    }

    // Build conversation history.
    const history = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const answer = await this.complete(history, context);

    const assistantMsg = await this.prisma.chatMessage.create({
      data: { conversationId, role: 'assistant', content: answer },
    });
    await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
    this.events.emitChatMessage(conversationId, assistantMsg);

    return assistantMsg;
  }

  private async complete(
    history: Array<{ role: string; content: string }>,
    context: string,
  ): Promise<string> {
    if (!this.client) {
      return 'チャット機能を利用するにはサーバーにGROQ_API_KEYを設定してください。（デモ応答）';
    }

    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\n# 参考情報(コンテキスト)\n${context}`
      : SYSTEM_PROMPT;

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.4,
        messages: [
          { role: 'system', content: systemContent },
          ...history.map((m) => ({
            role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
            content: m.content,
          })),
        ],
      });
      return completion.choices[0]?.message?.content?.trim() || '申し訳ありません、回答を生成できませんでした。';
    } catch (e) {
      this.logger.error(`Groq completion failed: ${(e as Error).message}`);
      return '申し訳ありません、現在AIアシスタントに接続できません。しばらくしてからお試しください。';
    }
  }
}
