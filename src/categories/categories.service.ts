import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionalRepository } from '../common/transaction/transactional-repository.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';

@Injectable()
export class CategoriesService {
    constructor(
        private readonly transactionalRepository: TransactionalRepository,
        private readonly meilisearchService: MeilisearchService,
    ) { }

    private client() {
        return this.transactionalRepository.getClient();
    }

    async create(dto: CreateCategoryDto) {
        const category = await this.client().categories.create({ data: dto });
        await this.meilisearchService.upsertDocument('categories', category);
        return category;
    }

    async findAll() {
        //return this.client().categories.findMany();
        const result = await this.meilisearchService.search('categories', '');
        return result.hits;
    }

    async findOne(id: number) {
        const entity = await this.client().categories.findUnique({ where: { id } });
        if (!entity) throw new NotFoundException(`Category ${id} not found`);
        return entity;
    }

    async update(id: number, dto: UpdateCategoryDto) {
        await this.findOne(id);
        const category = await this.client().categories.update({
            where: { id },
            data: dto,
        });
        await this.meilisearchService.upsertDocument('categories', category);
        return category;
    }

    async remove(id: number) {
        await this.findOne(id);
        await this.client().categories.delete({ where: { id } });
        await this.meilisearchService.deleteDocument('categories', id);
        return { deleted: true };
    }

    async search(query: string) {
        return this.meilisearchService.search('categories', query);
    }
}