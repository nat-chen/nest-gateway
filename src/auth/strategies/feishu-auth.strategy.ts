import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { FastifyRequest } from 'fastify';
import { AuthService } from '../auth.service';

@Injectable()
export class FeishuStrategy extends PassportStrategy(Strategy, 'feishu') {
  constructor(private authService: AuthService) {
    super();
  }
  async validate(req: FastifyRequest): Promise<Payload> {
    const q: any = req.query;
    const user = await this.authService.validateFeishuUser(q.code);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
