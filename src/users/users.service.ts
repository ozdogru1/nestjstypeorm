import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) { }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(email: string, password: string) {
    const user = new User();
    user.email = email;
    user.password = password;
    return this.usersRepository.save(user);
  }
}
