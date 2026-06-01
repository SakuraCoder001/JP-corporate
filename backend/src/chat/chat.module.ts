import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController, AdminChatController } from './chat.controller';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [RagModule],
  providers: [ChatService],
  controllers: [ChatController, AdminChatController],
  exports: [ChatService],
})
export class ChatModule {}
