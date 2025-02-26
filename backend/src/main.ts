import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Test database connection
  try {
    const orm = app.get(MikroORM);
    await orm.em.getConnection().execute('SELECT 1');
    logger.log('Database connection successful');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }

  // Add more detailed request logging middleware
  app.use((req, res, next) => {
    const logger = new Logger('Request');
    logger.log('=== Incoming Request ===');
    logger.log('Method:', req.method);
    logger.log('Original URL:', req.originalUrl);
    logger.log('Base URL:', req.baseUrl);
    logger.log('Path:', req.path);
    logger.log('Headers:', req.headers);
    next();
  });

  const allowedOrigins = [
    'https://puppy-spa.vercel.app',    // Add your Vercel domain
    'http://localhost:3000',           // Local frontend
    'http://localhost:3001'            // Local backend
  ];

  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
  });
  
  app.setGlobalPrefix('api');
  
  const port = 3001;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API Base URL: http://localhost:${port}/api`);
}
bootstrap(); 