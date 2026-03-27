import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TransactionContext {
  private readonly storage = new AsyncLocalStorage<QueryRunner>();

  run<T>(queryRunner: QueryRunner, callback: () => T): T {
    return this.storage.run(queryRunner, callback);
  }

  getQueryRunner(): QueryRunner | undefined {
    return this.storage.getStore();
  }
}
