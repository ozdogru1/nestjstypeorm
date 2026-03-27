import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from '../common/repositories/base.repository';
import { User } from './user.entity';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
    constructor(
        dataSource: DataSource,
        @Inject(REQUEST) request: any,
    ) {
        super(User, dataSource, request);
    }
}