"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const core_2 = require("@mikro-orm/core");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    try {
        const orm = app.get(core_2.MikroORM);
        await orm.em.getConnection().execute('SELECT 1');
        logger.log('Database connection successful');
    }
    catch (error) {
        logger.error('Database connection failed:', error);
        process.exit(1);
    }
    app.use((req, res, next) => {
        const logger = new common_1.Logger('Request');
        logger.log('=== Incoming Request ===');
        logger.log('Method:', req.method);
        logger.log('Original URL:', req.originalUrl);
        logger.log('Base URL:', req.baseUrl);
        logger.log('Path:', req.path);
        logger.log('Headers:', req.headers);
        next();
    });
    app.enableCors({
        origin: 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept']
    });
    app.setGlobalPrefix('api');
    const port = 3001;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`API Base URL: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map