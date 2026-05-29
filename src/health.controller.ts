import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'points-open-backend',
      widgetId: process.env.WIDGET_ID,
      timestamp: new Date().toISOString(),
    };
  }
}
