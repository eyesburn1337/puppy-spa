import { Options } from '@mikro-orm/core';
import { Puppy } from './domain/entities/puppy.entity';
import { WaitingList } from './domain/entities/waiting-list.entity';

const config: Options = {
  entities: [Puppy, WaitingList],
  dbName: 'puppy_spa',
  type: 'postgresql',
  clientUrl: process.env.DATABASE_URL,
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
};

export default config; 