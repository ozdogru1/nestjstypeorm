import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { ProductsModule } from './products/products.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { winstonConfig } from './logger/winston.config';
import { TransactionModule } from './common/transaction/transaction.module';
import { PrismaModule } from './prisma/prisma.module';
import { MeilisearchModule } from './meilisearch/meilisearch.module';
import { CategoriesModule } from './categories/categories.module';
import { AppController } from './app.controller';
import { HttpClientService } from './http/http-client.service';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { EcommerceProfileGuard } from './http/ecommerce-profile.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 600000,
    }),
    WinstonModule.forRoot(winstonConfig),
    MeilisearchModule,
    PrismaModule,
    TransactionModule,
    ProductsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [
    HttpClientService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: EcommerceProfileGuard,
    },
  ],

})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
