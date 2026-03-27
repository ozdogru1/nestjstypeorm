import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { from, lastValueFrom, Observable } from 'rxjs';
import { DataSource, QueryRunner } from 'typeorm';
import { TransactionContext } from '../transaction/transaction-context';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContext,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    return from(
      this.transactionContext.run(queryRunner, async () => {
        try {
          const result = await lastValueFrom(next.handle());
          await queryRunner.commitTransaction();
          return result;
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      }),
    );
  }
}
