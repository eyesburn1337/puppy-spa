import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Puppy } from './core/domain/entities/puppy.entity';
import { WaitingList } from './core/domain/entities/waiting-list.entity';

const config: Options<PostgreSqlDriver> = {
  entities: [Puppy, WaitingList],
  dbName: 'puppy_spa',
  type: 'postgresql',
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  debug: true,
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
    disableForeignKeys: false,
    safe: true,
    allOrNothing: true,
    transactional: true,
  },
  discovery: {
    warnWhenNoEntities: true,
    requireEntitiesArray: true,
  },
  allowGlobalContext: true
};

export default config; 