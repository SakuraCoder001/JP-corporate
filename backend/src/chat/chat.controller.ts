import { Body, Controller, Get, Ip, Param, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class StartDto {
  @IsOptional() @IsString() sessionId?: string;
}

class MessageDto {
  @IsString() @MinLength(1) message: string;
}

/** Public chat endpoints used by the website widget. */
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('start')
  start(@Body() dto: StartDto, @Ip() ip: string) {
    return this.chat.startConversation(ip, dto.sessionId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.chat.getConversation(id);
  }

  @Post(':id/message')
  send(@Param('id') id: string, @Body() dto: MessageDto) {
    return this.chat.sendMessage(id, dto.message);
  }
}

/** Admin endpoints for monitoring conversations. */
@UseGuards(JwtAuthGuard)
@Controller('admin/chat')
export class AdminChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('conversations')
  list() {
    return this.chat.listConversations();
  }

  @Get('conversations/:id')
  get(@Param('id') id: string) {
    return this.chat.getConversation(id);
  }
}
