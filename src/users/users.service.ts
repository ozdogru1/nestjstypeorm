import { Injectable } from '@nestjs/common';
import { TransactionalRepository } from '../common/transaction/transactional-repository.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly transactionalRepository: TransactionalRepository,
  ) { }

  private client() {
    return this.transactionalRepository.getClient();
  }

  findByEmail(email: string) {
    return this.client().user.findUnique({ where: { email } });
  }

  async create(email: string, password: string) {
    return this.client().user.create({
      data: { email, password },
    });
  }
}
