import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  app.enableCors();
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 Points Open Backend running on http://0.0.0.0:${port}`);
  console.log(`🎯 Widget ID: ${process.env.WIDGET_ID}`);
  console.log(`🔗 Klyb API: ${process.env.KLYB_API_URL}`);
  console.log(`⏱  Cron: every 5 minutes\n`);
}

bootstrap();
