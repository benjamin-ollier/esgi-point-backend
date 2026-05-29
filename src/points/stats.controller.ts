import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':communityId/:memberId')
  async getMemberStats(
    @Param('communityId') communityId: string,
    @Param('memberId') memberId: string,
  ) {
    if (!communityId || !memberId) {
      throw new NotFoundException('communityId and memberId are required');
    }

    const activity = await this.prisma.memberActivity.findUnique({
      where: { communityId_memberId: { communityId, memberId } }
    });
    
    if (!activity) {
      return {
        postsCount: 0,
        eventsCount: 0,
        totalPoints: 0,
      };
    }

    return {
      postsCount: activity.postsCount,
      eventsCount: activity.eventsCount,
      totalPoints: activity.totalPoints,
    };
  }
}
