import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PointsModule } from './points/points.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PointsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
