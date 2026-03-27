import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TransactionInterceptor } from './common/interceptors/transaction.interceptor';
import { DataSource } from 'typeorm';
import { TransactionContext } from './common/transaction/transaction-context';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  const dataSource = app.get(DataSource);
  const transactionContext = app.get(TransactionContext);
  app.useGlobalInterceptors(
    new TransactionInterceptor(dataSource, transactionContext),
  );

  const logger = app.get(WINSTON_MODULE_PROVIDER);
  console.log = (...args) => logger.info(args.join(' '));
  console.error = (...args) => logger.error(args.join(' '));
  app.useGlobalFilters(new AllExceptionsFilter(logger));

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
