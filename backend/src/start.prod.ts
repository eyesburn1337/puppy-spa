import { MikroORM } from '@mikro-orm/core';
import mikroOrmConfig from './mikro-orm.config';

async function runMigrations() {
  const orm = await MikroORM.init(mikroOrmConfig);
  
  try {
    const migrator = orm.getMigrator();
    await migrator.up();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    await orm.close();
  }
}

async function bootstrap() {
  try {
    await runMigrations();
    // Import and run the main app
    require('./main');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap(); 