import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { TransactionalRepository } from '../common/transaction/transactional-repository.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly transactionalRepository: TransactionalRepository,
  ) { }

  private repository() {
    return this.transactionalRepository.getRepository(User);
  }

  findByEmail(email: string) {
    return this.repository().findOne({ where: { email } });
  }

  async create(email: string, password: string) {
    const user = new User();
    user.email = email;
    user.password = password;
    return this.repository().save(user);
  }
}
