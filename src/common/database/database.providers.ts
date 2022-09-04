import { DataSource, DataSourceOptions } from 'typeorm';
import { getConfig } from 'src/utils/index';
import * as path from 'path';
import { NamingStrategy } from './naming.strategies';

// 设置数据库类型
const databaseType: DataSourceOptions['type'] = 'mongodb';
const { MONGODB_CONFIG, MYSQL_CONFIG } = getConfig();

// 静态文件处理与 webpack hmr 热更新冲突
const MONGODB_DATABASE_CONFIG = {
  ...MONGODB_CONFIG,
  NamedNodeMap: new NamingStrategy(),
  type: databaseType,
  entities: [
    path.join(
      __dirname,
      `../../**/*.${MONGODB_CONFIG.entities}.entity{.ts,.js}`,
    ),
  ],
};

const MYSQL_DATABASE_CONFIG = {
  ...MONGODB_CONFIG,
  NamedNodeMap: new NamingStrategy(),
  type: databaseType,
  entities: [
    path.join(__dirname, `../../**/*.${MYSQL_CONFIG.entities}.entity{.ts,.js}`),
  ],
};

const MONGODB_CONNECTION = new DataSource(MONGODB_DATABASE_CONFIG);
const MYSQL_CONNECTION = new DataSource(MYSQL_DATABASE_CONFIG);

// 数据库注入
export const DatabaseProviders = [
  {
    provide: 'MONGODB_CONNECTION',
    useFactory: async () => {
      if (!MONGODB_CONNECTION.isInitialized)
        await MONGODB_CONNECTION.initialize();
      return MONGODB_CONNECTION;
    },
  },
  {
    provide: 'MYSQL_CONNECTION',
    useFactory: async () => {
      if (!MYSQL_CONNECTION.isInitialized) await MYSQL_CONNECTION.initialize();
      return MYSQL_CONNECTION;
    },
  },
];
