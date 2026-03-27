import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from '../common/repositories/base.repository';
import { Product } from './product.entity';

@Injectable()
export class ProductsRepository extends BaseRepository<Product> {
    constructor(
        dataSource: DataSource,
        @Inject(REQUEST) request: any,
    ) {
        super(Product, dataSource, request);
    }
}