import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private client!: MeiliSearch;
  private readonly logger = new Logger(MeilisearchService.name);

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    this.client = new MeiliSearch({
      host: this.configService.get<string>('MEILI_HOST') as string,
      apiKey: this.configService.get<string>('MEILI_MASTER_KEY') as string,
    });

    this.logger.log('Meilisearch bağlantısı kuruldu ✅');
  }

  async upsertDocument(indexName: string, document: any) {
    try {
      await this.ensureIndex(indexName);
      const index = this.client.index(indexName);
      await index.addDocuments([document]);
    } catch (error) {
      this.logger.error(`upsertDocument hatası: ${getErrorMessage(error)}`);
    }
  }

  async deleteDocument(indexName: string, id: number) {
    try {
      const index = this.client.index(indexName);
      await index.deleteDocument(id);
    } catch (error) {
      this.logger.error(`deleteDocument hatası: ${getErrorMessage(error)}`);
    }
  }

  async search(indexName: string, query: string, options?: any) {
    try {
      const index = this.client.index(indexName);
      return index.search(query, options);
    } catch (error) {
      this.logger.error(`search hatası: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async syncIndex(indexName: string, documents: any[]) {
    try {
      await this.ensureIndex(indexName);
      const index = this.client.index(indexName);
      await index.deleteAllDocuments();
      if (documents.length > 0) {
        await index.addDocuments(documents);
      }
      this.logger.log(`${indexName} sync edildi: ${documents.length} kayıt ✅`);
    } catch (error) {
      this.logger.error(`syncIndex hatası: ${getErrorMessage(error)}`);
    }
  }

  private async ensureIndex(indexName: string) {
    try {
      await this.client.createIndex(indexName, { primaryKey: 'id' });
    } catch {
      // Index zaten varsa devam et
    }

    const index = this.client.index(indexName);
    await index.updateFilterableAttributes(['categoryId']);
    await index.updateSortableAttributes(['price', 'createdAt', 'name']);
  }
}

