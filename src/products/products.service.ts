import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TransactionalRepository } from '../common/transaction/transactional-repository.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly transactionalRepository: TransactionalRepository,
    private readonly meilisearchService: MeilisearchService,
  ) { }

  private client() {
    return this.transactionalRepository.getClient();
  }

  async create(dto: CreateProductDto) {
    const product = await this.client().product.create({
      data: dto,
      include: { category: true },
    });
    const meiliDoc = {
      ...product,
      category: product.category
        ? { id: product.category.id, name: product.category.name }
        : null,
    };
    await this.meilisearchService.upsertDocument('product', meiliDoc);
    return product;
  }

  async findAll() {
    return this.client().product.findMany({
      include: {
        category: true,
      },
    });
  }

  async findOne(id: number) {
    const entity = await this.client().product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    if (!entity) throw new NotFoundException(`Product ${id} not found`);
    return entity;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    const product = await this.client().product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
    await this.meilisearchService.upsertDocument('product', product);
    return product;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.client().product.delete({ where: { id } });
    await this.meilisearchService.deleteDocument('product', id);
    return { deleted: true };
  }

  async search(query: string, categoryId?: number) {
    const options: any = {};

    if (categoryId) {
      options.filter = `categoryId = ${categoryId}`;
    }

    return this.meilisearchService.search('product', query, options);
  }
}
