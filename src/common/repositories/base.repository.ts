import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BaseRepository<T extends ObjectLiteral> {
    private entity: EntityTarget<T>;
    protected repository: Repository<T>;

    constructor(
        entity: EntityTarget<T>,
        private readonly dataSource: DataSource,
        @Inject(REQUEST) private readonly request: any,
    ) {
        this.entity = entity;
        this.repository = this.dataSource.getRepository(entity);
    }

    private getRepository(): Repository<T> {
        const queryRunner = this.request?.queryRunner;
        if (queryRunner) {
            return queryRunner.manager.getRepository(this.entity);
        }
        return this.repository;
    }

    async save(entity: any): Promise<T> {
        return this.getRepository().save(entity);
    }

    async findOne(options: any): Promise<T | null> {
        return this.getRepository().findOne(options);
    }

    async find(options?: any): Promise<T[]> {
        return this.getRepository().find(options);
    }

    async delete(options: any): Promise<void> {
        await this.getRepository().delete(options);
    }

    async update(options: any, entity: any): Promise<void> {
        await this.getRepository().update(options, entity);
    }
}