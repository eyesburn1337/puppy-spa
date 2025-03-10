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
    'https://puppy-spa-beta.vercel.app',    // Vercel frontend
    'http://localhost:3000',                // Local frontend
    process.env.CORS_ORIGIN                // From environment
  ].filter(Boolean);

  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
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