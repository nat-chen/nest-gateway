# 需求分析

## 应用场景

所有功能都放在一个系统里面开发部署，其中任意一个模块出现了问题都可能会导致整个系统雪崩。
对于一个应用的稳定性来说，如果没办法对单一的模块做熔断、升级、回滚等操作，线上不可控的概率极大，这也是目前主流采用微服务架构最大的原因之一。

## 网关系统（Gateway）

网关系统根据请求类型可以分为：

静态资源网关：处理前端资源数据包括 CSR、SSR 等；
API 网关：随着微服务架构（MSA）的普及，通过统一的 API 网关可以聚合所有零散的微服务资源，保持统一的出入口，降低多项目的接入成本以及其他项目的使用成本。
从功能属性上可以分为：

流量网关：无关业务属性，单纯做安全（黑白名单）、分流（负载均衡）等；
业务网关：用户（认证、鉴权）、服务稳定性（降级、容灾）、业务属性灰度、代理（资源代理、缓存）、统一前置（日志、数据校验）等。

## Nginx

Nginx 作为专业的 WEB 代理服务器，在代理方面能够提供负载均衡、流量切换等功能。

那么 Nginx 做不到什么呢？
- Nginx 作为专业的转发服务器，对 Session 以及 Cookie 的处理比较弱。
- Nginx仅仅支持 HTTP 协议（Email 不算常用功能）。
- 没有可视化管理界面也是一个比较大的硬伤（开源的有一些可视化配置项目，但跟可视化管理有一定的区别与差距）

正向代理是代理客户端，为客户端收发请求，使真实客户端对服务器不可见（翻墙）；而反向代理是代理服务器端，为服务器收发请求，使真实服务器对客户端不可见（nginx）

## Gateway

业务性的 Gateway 需要做点啥：

- 统一鉴权收口，通过统一配置给接口资源添加权限；
- 支持 RPC 微服务调用，减少资源消耗；
- 系统易于监控，同时可以采集收口进来的信息。

通过两者的对比可以看出，Nginx 更关注负载均衡以及反向代理，对业务部分的侵入很低，而 Gateway 作为后端应用，可以携带业务属性，两者可以很好的互补。
在系统架构设计上，由 Nginx 做一层流量代理，通过负载均衡到 Gateway 做业务层的转发处理，这样可以减少我们自建网关系统的工作量。

https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e15b1e4bc0b842a1affeba55594b232d~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?


# 技术选型

数据库选项

- MySQL 作为典型的关系型数据库，支持单点、集群部署架构，成熟度非常高。对于复杂读写操作，需要组合索引查询多表，对性能消耗不小，需要做读写分离或者表结构拆解，对业务架构设计要求比较高。

- MongoDB 是非关系型数据库、nosql 的代表作。它可以通过副本集、分片实现高可用，在集群架构拥有十分高的扩展性，但要实现这种高可用对运维的要求比较高。数据处理方式 是基于内存的，将热数据存在物理内存中，从而达到高速读写。由于性能出色，一般用在博客、内管管理等大数据存储的系统中较为合适。

- Redis 是一个高性能的 key-value 数据库，一般常用于业务数据缓存的操作。


# 熟悉 NestJS

控制反转（Inversion of Control，缩写为 IoC）是面向对象编程中的一种设计原则，可以用来降低计算机代码之间的耦合度。其中最常见的方式叫做依赖注入（Dependency Injection，简称DI），还有一种方式叫“依赖查找”（Dependency Lookup）。通过控制反转，对象在被创建的时候，由一个调控系统内所有对象的外界实体将其所依赖的对象的引用传递给它。也可以说，依赖被注入到对象中。

生成配套文件：`nest g resource user`


# 基础功能配置

Nest 作为一个上层框架，可以通过适配器模式使得底层可以兼容任意 HTTP 类型的 Node 框架，本身内置的框架有两种 Express 与 Fastify。

Fastify 与其他主流 HTTP 框架对比 (Expreess)，其在 QPS(并发处理请求)的效率上要远超其他框架，达到了几乎两倍的基准测试结果，在网关系统这个对性能要求非常高的项目中使用 Fastify 无疑是一种非常好的选择。

在业务复杂度以及对性能要求并非十分敏感的项目中，Express 也是一种非常好的选择，作为老牌的框架，它经历了非常多的大型项目实战的考验以及长期的迭代，使得 Express 社区生态非常的丰富

## 版本控制

```js
// 全局
app.enableVersioning({
  defaultVersion: '1',
  defaultVersion: [VERSION_NEUTRAL, '1', '2']
});

@Get()
@Version([VERSION_NEUTRAL, '1'])
findAll() {
  return this.userService.findAll();
}
```

## 全局返回参数

拦截器 `transform.interceptor.ts`，对响应的数据格式化
全局拦截 `app.useGlobalInterceptors(new TransformInterceptor())`

## 全局异常拦截

除了正常返回数据，对异常处理做一层标准封装：`base.exception.filter` 和 `http.exception.filter`
全局异常过滤器 `app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter())`

另外新增一个 business.exception.ts 主动抛出的业务异常

## 环境配置

`@nestjs/config` 默认会从项目根目录载入并解析一个 .env 文件，从 .env 文件和 process.env 合并环境变量键值对，并将结果存储到一个可以通过 ConfigService 访问的私有结构。

`forRoot()` 方法注册了 ConfigService 提供者，后者提供了一个 `get()` 方法来读取这些解析/合并的配置变量。

当一个键同时作为环境变量（例如，通过操作系统终端如export DATABASE_USER=test导出）存在于运行环境中以及.env文件中时，以运行环境变量优先。

**YAML**
Nest 自带了环境配置的功能，使用的 dotenv 来作为默认解析，此次使用结构更加清晰的 YAML 来覆盖默认配置。
在使用自定义 YAML 配置文件之前，先要修改 app.module.ts 中 ConfigModule 的配置项 ignoreEnvFile，禁用默认读取 .env 的规则

```js
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    gnoreEnvFile: true,
    isGlobal: true, // 全局注册，没有添加时，则需要先对应的 module 文件中注册后才能正常使用 ConfigService。
    load: [getConfig] // YAML 文件
  })],
})
```

使用 cross-env 指定运行环境来使用对应环境的配置变量
`"start:dev": "cross-env RUNNING_ENV=dev nest start --watch",`

## 热重载

NestJS 的 dev 模式是将 TS 代码编译成 JS 再启动，这样每次我们修改代码都会重复经历一次编译的过程，为了避免这个情况，NestJS 也提供了热重载的功能，借助 Webpack 的 HMR，使得每次更新只需要替换更新的内容，减少编译的时间与过程。

默认情况下，在 TS 开发的项目中是没办法导入 .json 后缀的模块，在 tsconfig.json 中新增 resolveJsonModule 配置即可。


# 数据库

docker run -d -p 27017:27017 --name fast_gateway_test -v mongo-data:/data/db -e MONGODB_INITDB_ROOT_USERNAME=root -e MONGODB_INITDB_ROOT_PASSWORD=123456 mongo

docker run -d -p 6379:6379 --name my_redis redis





