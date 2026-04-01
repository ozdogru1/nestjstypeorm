import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { from, lastValueFrom, Observable } from 'rxjs';
import { TransactionContext } from '../transaction/transaction-context';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionContext: TransactionContext,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return from(
      this.prisma.$transaction(async (tx) =>
        this.transactionContext.run(tx, async () => {
          return await lastValueFrom(next.handle());
        }),
      ),
    );
  }
}
