import { Controller, Get, UnauthorizedException, Req } from '@nestjs/common';
import { PointsService } from './points.service';
import { Request } from 'express';

@Controller('cron')
export class CronController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('recalculate')
  async triggerRecalculate(@Req() req: Request) {
    // Vercel Cron sends a Bearer token with the CRON_SECRET if configured.
    // If CRON_SECRET is defined in the environment, we must verify it.
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret) {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${expectedSecret}`) {
        throw new UnauthorizedException('Invalid cron secret');
      }
    }

    // Trigger the actual cron logic
    console.log('🤖 Triggering Points Recalculation from Vercel Cron...');
    await this.pointsService.recalculatePoints();
    
    return { success: true, message: 'Recalculation complete' };
  }
}
