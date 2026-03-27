import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
  ) {}

  async create(dto: CreateProductDto) {
    const product = await this.productsRepository.save(dto);
    //const obj = null;
    //console.log(obj.name);
    return product;
  }

  findAll() {
    return this.productsRepository.find();
  }

  async findOne(id: number) {
    const entity = await this.productsRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return entity;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    await this.productsRepository.update({ id }, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.productsRepository.delete({ id });
    return { deleted: true };
  }
}
