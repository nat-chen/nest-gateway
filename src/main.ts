import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';
import {
  ValidationPipe,
  VersioningType,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/exceptions/base.exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { generateDocument } from './doc';
import { FastifyLogger } from './common/logger';
import fastifyCookie from '@fastify/cookie';
import fastify from 'fastify';

declare const module: any;

async function bootstrap() {
  const fastifyInstance = fastify({
    logger: FastifyLogger,
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance),
  );

  app.register(fastifyCookie, {
    secret: 'my-secret', // for cookies signature
  });

  // 响应数据拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 异常过滤器
  app.useGlobalFilters(new AllExceptionFilter(), new HttpExceptionFilter());

  // 接口版本管理
  app.enableVersioning({
    defaultVersion: [VERSION_NEUTRAL, '1', '2'], // 同时支持 ''/v1/v2 访问
    type: VersioningType.URI,
  });

  // 启动全局字段校验，保证请求接口字段校验正确
  app.useGlobalPipes(new ValidationPipe());

  // 创建文档
  generateDocument(app);

  // 添加热更新
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  await app.listen(3000);
}

bootstrap();
