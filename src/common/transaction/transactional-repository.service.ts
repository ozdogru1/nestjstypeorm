import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { TransactionContext } from './transaction-context';

@Injectable()
export class TransactionalRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TransactionContext,
  ) {}

  getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): Repository<T> {
    const queryRunner = this.transactionContext.getQueryRunner();
    if (queryRunner) {
      return queryRunner.manager.getRepository(entity);
    }
    return this.dataSource.getRepository(entity);
  }

}
