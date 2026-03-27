import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TransactionalRepository } from '../common/transaction/transactional-repository.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly transactionalRepository: TransactionalRepository,
  ) {}

  private repository() {
    return this.transactionalRepository.getRepository(Product);
  }

  async create(dto: CreateProductDto) {
    const product = await this.repository().save(dto);
    //const obj = null;
    //console.log(obj.name);
    return product;
  }

  findAll() {
    return this.repository().find();
  }

  async findOne(id: number) {
    const entity = await this.repository().findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return entity;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    await this.repository().update({ id }, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repository().delete({ id });
    return { deleted: true };
  }
}
