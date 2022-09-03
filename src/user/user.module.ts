import { UserController } from './user.controller';
import { DatabaseModule } from '../common/database/database.module';
import { Module } from '@nestjs/common';
import { FeishuService } from './feishu/feishu.service';
import { FeishuController } from './feishu/feishu.controller';
import { UserProviders } from './user.providers';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FeishuController, UserController],
  providers: [...UserProviders, UserService, FeishuService],
  exports: [UserService, FeishuService],
})
export class UserModule {}
