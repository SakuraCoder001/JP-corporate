import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Do not block Nest startup if Neon is unreachable (e.g. suspended project, firewall).
    void this.$connect().catch((err: Error) => {
      // eslint-disable-next-line no-console
      console.warn(
        `[Prisma] Database not reachable yet — API calls will fail until DATABASE_URL works: ${err.message}`,
      );
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
