import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Puppy } from './core/domain/entities/puppy.entity';
import { WaitingList } from './core/domain/entities/waiting-list.entity';
import { PuppyController } from './interface/controllers/puppy.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature([Puppy, WaitingList])
  ],
  controllers: [PuppyController],
  providers: []
})
export class AppModule {} 