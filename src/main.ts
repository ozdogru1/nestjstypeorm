import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TransactionInterceptor } from './common/interceptors/transaction.interceptor';
import { TransactionContext } from './common/transaction/transaction-context';
import { PrismaService } from './prisma/prisma.service';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  app.useGlobalInterceptors(new ResponseInterceptor());

  const prisma = app.get(PrismaService);
  const transactionContext = app.get(TransactionContext);
  app.useGlobalInterceptors(
    new TransactionInterceptor(prisma, transactionContext),
  );

  const logger = app.get(WINSTON_MODULE_PROVIDER);
  console.log = (...args) => logger.info(args.join(' '));
  console.error = (...args) => logger.error(args.join(' '));
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(3000);
}

bootstrap();
