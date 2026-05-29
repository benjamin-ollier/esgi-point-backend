import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PointsService } from './points/points.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });
  
  const pointsService = app.get(PointsService);
  console.log('🚀 Lancement du recalcul manuel des points...');
  
  try {
    await pointsService.recalculatePoints();
    console.log('✅ Recalcul terminé avec succès.');
  } catch (error) {
    console.error('❌ Erreur lors du recalcul:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
