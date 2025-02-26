import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';

async function resetDatabase() {
  const orm = await MikroORM.init(config);
  const generator = orm.getSchemaGenerator();

  try {
    await generator.dropSchema();
    console.log('Schema dropped');

    await generator.createSchema();
    console.log('Schema created');

    await generator.updateSchema();
    console.log('Schema updated');

    await orm.close(true);
    console.log('Database reset complete');
  } catch (error) {
    console.error('Error resetting database:', error);
    await orm.close(true);
    process.exit(1);
  }
}

resetDatabase(); 