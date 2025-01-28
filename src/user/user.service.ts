import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm/index';
import { User } from './entities/user.entity';
import { ICreateUser, IUpdateUser } from './user.types';
import { NotFoundError } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(input: ICreateUser) {
    const user = new User();
    user.email = input.email;
    user.firstName = input.firstName;
    user.lastName = input.lastName;
    user.password = input.password;

    return await user.save();
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(ID: string) {
    return this.usersRepository.findOneBy({ ID });
  }

  async getById(ID: string) {
    const user = await this.usersRepository.findOneBy({ ID });
    if (!user) {
      throw new NotFoundException('User not Found');
    }

    return user;
  }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not Found');
    }

    return user;
  }

  async updateUserByFilters(filters: FindOptionsWhere<User>, input: IUpdateUser) {
    const user = await this.usersRepository.findOneBy(filters);
    if (!user) {
      throw new NotFoundException('User not Found');
    }

    if (input.email) user.email = input.email;
    if (input.firstName) user.firstName = input.firstName;
    if (input.lastName) user.lastName = input.lastName;
    if (input.isEmailVerified) user.isEmailVerified = input.isEmailVerified;

    return user.save();
  }

  async deleteUserByFilters(filters: FindOptionsWhere<User>) {
    await this.usersRepository.delete(filters);
  }
}
