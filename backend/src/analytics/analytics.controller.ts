import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateSessionDto {
  @IsOptional() @IsString() userAgent?: string;
  @IsOptional() @IsString() referrer?: string;
  @IsOptional() @IsString() email?: string;
}

class RecordEventDto {
  @IsString() sessionId: string;
  @IsIn(['pageview', 'click']) type: 'pageview' | 'click';
  @IsOptional() @IsString() label?: string;
  @IsOptional() @IsString() path?: string;
}

@Controller('track')
export class TrackingController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('session')
  createSession(@Body() dto: CreateSessionDto, @Ip() ip: string, @Req() req: Request) {
    const headerIp =
      (req.headers['x-forwarded-for'] as string) ||
      (req.socket?.remoteAddress as string) ||
      ip;
    return this.analytics.createSession({
      ip: headerIp,
      userAgent: dto.userAgent || (req.headers['user-agent'] as string),
      referrer: dto.referrer,
      email: dto.email,
    });
  }

  @Post('event')
  recordEvent(@Body() dto: RecordEventDto) {
    return this.analytics.recordEvent(dto);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('sessions')
  sessions() {
    return this.analytics.listSessions();
  }

  @Get('sessions/:id')
  session(@Param('id') id: string) {
    return this.analytics.getSession(id);
  }
}
