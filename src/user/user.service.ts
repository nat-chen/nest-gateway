import { In, Like, Raw, MongoRepository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { User } from './user.mongo.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: MongoRepository<User>,
  ) {}

  createOrSave(user) {
    try {
      const result = this.userRepository.save(user);
      return result;
    } catch (err) {
      console.log(err);
    }
  }
}
