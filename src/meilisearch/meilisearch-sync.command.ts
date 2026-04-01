import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MeilisearchService } from './meilisearch.service';
import { PrismaService } from '../prisma/prisma.service';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const meilisearchService = app.get(MeilisearchService);
  const prisma = app.get(PrismaService);

  console.log('Dinamik sync başlıyor...');

  const allowedModels = ['product', 'categories'];

  const models = Object.keys(prisma).filter(
    (key) =>
      !key.startsWith('_') &&
      !key.startsWith('$') &&
      typeof (prisma as any)[key] === 'object' &&
      allowedModels.includes(key),
  );

  console.log(`Tespit edilen tablolar: ${models.join(', ')}`);

  for (const model of models) {
    try {
      const data = await (prisma as any)[model].findMany();
      console.log(`${model}: ${data.length} kayıt bulundu`);

      await meilisearchService.syncIndex(model, data);
    } catch (error) {
      console.error(`${model}: Hata ❌ ${getErrorMessage(error)}`);
    }
  }

  console.log('Tüm tablolar sync edildi! 🚀');
  await app.close();
}

bootstrap();

