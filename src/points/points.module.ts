import { Module } from '@nestjs/common';
import { ClubzApiService } from './clubz-api.service';
import { PointsService } from './points.service';
import { StatsController } from './stats.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [StatsController],
  providers: [ClubzApiService, PointsService, PrismaService],
})
export class PointsModule {}
