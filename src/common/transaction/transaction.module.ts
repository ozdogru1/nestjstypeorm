import { Global, Module } from '@nestjs/common';
import { TransactionContext } from './transaction-context';
import { TransactionalRepository } from './transactional-repository.service';

@Global()
@Module({
  providers: [TransactionContext, TransactionalRepository],
  exports: [TransactionContext, TransactionalRepository],
})
export class TransactionModule {}
