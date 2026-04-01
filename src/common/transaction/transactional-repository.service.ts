import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionContext } from './transaction-context';

@Injectable()
export class TransactionalRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionContext: TransactionContext,
  ) {}

  getClient(): Prisma.TransactionClient {
    const client = this.transactionContext.getClient();
    if (client) {
      return client;
    }
    return this.prisma;
  }
}
