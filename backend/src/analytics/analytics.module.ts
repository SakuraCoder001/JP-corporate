import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackingController, AdminAnalyticsController } from './analytics.controller';

@Module({
  providers: [AnalyticsService],
  controllers: [TrackingController, AdminAnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
