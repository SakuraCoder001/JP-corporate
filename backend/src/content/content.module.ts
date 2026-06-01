import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { PublicContentController, AdminContentController } from './content.controller';

@Module({
  providers: [ContentService],
  controllers: [PublicContentController, AdminContentController],
  exports: [ContentService],
})
export class ContentModule {}
