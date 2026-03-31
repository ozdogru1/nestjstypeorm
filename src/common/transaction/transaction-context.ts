import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TransactionContext {
  private readonly storage = new AsyncLocalStorage<Prisma.TransactionClient>();

  run<T>(client: Prisma.TransactionClient, callback: () => T): T {
    return this.storage.run(client, callback);
  }

  getClient(): Prisma.TransactionClient | undefined {
    return this.storage.getStore();
  }
}
