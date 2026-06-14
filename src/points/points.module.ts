import { Module } from '@nestjs/common';
import { KlybApiService } from './klyb-api.service';
import { PointsService } from './points.service';
import { StatsController } from './stats.controller';
import { CronController } from './cron.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [StatsController, CronController],
  providers: [KlybApiService, PointsService, PrismaService],
})
export class PointsModule {}
