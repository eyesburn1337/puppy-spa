import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';

async function init() {
  try {
    const orm = await MikroORM.init(config);
    const generator = orm.getSchemaGenerator();

    // Drop the existing schema and create a new one
    await generator.dropSchema();
    await generator.createSchema();

    console.log('Schema created successfully');

    // Create tables
    const queries = await generator.getCreateSchemaSQL();
    console.log('Database queries to be executed:', queries);

    await orm.close();
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

init(); 