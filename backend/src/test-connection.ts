import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config';

(async () => {
  try {
    const orm = await MikroORM.init(config);
    console.log('Connected to database successfully!');
    
    // Test the connection by running a simple query
    const connection = orm.em.getConnection();
    const result = await connection.execute('SELECT 1');
    console.log('Query result:', result);
    
    await orm.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
})(); 