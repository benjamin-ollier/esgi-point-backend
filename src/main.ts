import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  app.enableCors();
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`\n🚀 Points Open Backend running on http://localhost:${port}`);
  console.log(`🎯 Widget ID: ${process.env.WIDGET_ID}`);
  console.log(`🔗 Clubz API: ${process.env.CLUBZ_API_URL}`);
  console.log(`⏱  Cron: every 5 minutes\n`);
}

bootstrap();
