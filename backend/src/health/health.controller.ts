import { Controller, Get } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

@Controller('health')
export class HealthController {
  constructor(private readonly orm: MikroORM) {}

  @Get()
  async check() {
    try {
      await this.orm.em.getConnection().execute('SELECT 1');
      return { status: 'ok', message: 'Database connection successful' };
    } catch (error) {
      return { status: 'error', message: 'Database connection failed' };
    }
  }
} 