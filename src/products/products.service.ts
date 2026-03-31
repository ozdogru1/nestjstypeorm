import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TransactionalRepository } from '../common/transaction/transactional-repository.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly transactionalRepository: TransactionalRepository,
  ) { }

  private client() {
    return this.transactionalRepository.getClient();
  }

  async create(dto: CreateProductDto) {
    const product = await this.client().product.create({ data: dto });
    return product;
  }

  findAll() {
    return this.client().product.findMany();
  }

  async findOne(id: number) {
    const entity = await this.client().product.findUnique({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return entity;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.client().product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.client().product.delete({ where: { id } });
    return { deleted: true };
  }
}
