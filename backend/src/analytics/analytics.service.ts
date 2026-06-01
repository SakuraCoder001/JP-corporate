import { Injectable } from '@nestjs/common';
import * as geoip from 'geoip-lite';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

function normalizeIp(ip: string): string {
  if (!ip) return '';
  // strip IPv6 prefix for IPv4-mapped addresses
  return ip.replace('::ffff:', '').split(',')[0].trim();
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsGateway,
  ) {}

  async createSession(params: {
    ip: string;
    userAgent?: string;
    referrer?: string;
    email?: string;
  }) {
    const ip = normalizeIp(params.ip);
    const geo = ip ? geoip.lookup(ip) : null;

    const session = await this.prisma.visitorSession.create({
      data: {
        ip: ip || 'unknown',
        city: geo?.city || 'Unknown',
        region: geo?.region || '',
        country: geo?.country || '',
        userAgent: params.userAgent || '',
        referrer: params.referrer || '',
        email: params.email && params.email.trim() ? params.email.trim() : 'N/A',
      },
    });

    this.events.emitVisitorSession(session);
    return session;
  }

  async recordEvent(params: {
    sessionId: string;
    type: 'pageview' | 'click';
    label?: string;
    path?: string;
  }) {
    const event = await this.prisma.visitorEvent.create({
      data: {
        sessionId: params.sessionId,
        type: params.type,
        label: params.label || '',
        path: params.path || '',
      },
    });

    await this.prisma.visitorSession
      .update({ where: { id: params.sessionId }, data: { lastSeen: new Date() } })
      .catch(() => undefined);

    this.events.emitVisitorEvent(event);
    return event;
  }

  async listSessions(limit = 100) {
    return this.prisma.visitorSession.findMany({
      orderBy: { lastSeen: 'desc' },
      take: limit,
      include: {
        events: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
  }

  async getSession(id: string) {
    return this.prisma.visitorSession.findUnique({
      where: { id },
      include: { events: { orderBy: { createdAt: 'desc' } } },
    });
  }
}
