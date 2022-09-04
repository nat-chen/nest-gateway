import { Reflector } from '@nestjs/core';
import { IS_STREAM_KEY } from '@/auth/constants';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    const IS_STREAM = this.reflector.getAllAndOverride<boolean>(IS_STREAM_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    return next.handle().pipe(
      map((data) => ({
        data,
        status: 0,
        extra: {},
        message: 'success',
        success: true,
      })),
    );
  }
}
