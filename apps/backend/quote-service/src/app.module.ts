import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteModule } from './quote/quote.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { validate } from './config/env.validation';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    RabbitMQModule,
    QuoteModule,
  ],
})
export class AppModule {}
