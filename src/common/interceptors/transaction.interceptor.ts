import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
    constructor(private readonly dataSource: DataSource) { }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const request = context.switchToHttp().getRequest();
        request.queryRunner = queryRunner;

        return next.handle().pipe(
            tap(async () => {
                await queryRunner.commitTransaction();
                await queryRunner.release();
            }),
            catchError(async (error) => {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                throw error;
            }),
        );
    }
}