import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { winstonConfig } from './logger/winston.config';
import { TransactionModule } from './common/transaction/transaction.module';
import { PrismaModule } from './prisma/prisma.module';
import { MeilisearchModule } from './meilisearch/meilisearch.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(winstonConfig),
    MeilisearchModule,
    PrismaModule,
    TransactionModule,
    ProductsModule,
    CategoriesModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
