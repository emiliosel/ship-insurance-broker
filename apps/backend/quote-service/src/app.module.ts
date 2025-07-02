import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  JwtAuthGuard,
  RolesGuard,
  SharedAuthModule,
} from '@quote-system/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteRequest } from './domain/entities/quote-request.entity';
import { ResponderAssignment } from './domain/entities/responder-assignment.entity';
import { QuoteService } from './application/services/quote.service';
import { QuoteController } from './api/controllers/quote.controller';
import { QuoteRequestRepository } from './infrastructure/persistence/quote-request.repository';
import { RabbitMQService } from './infrastructure/messaging/rabbitmq.service';
import { RabbitMQModule as GolevelupRabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { HealthController } from './api/controllers/health.controller';
import { validate } from './config/env.validation';
import databaseConfig from './config/database.config';
import rabbitmqConfig from './config/rabbitmq.config';
import authConfig from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [databaseConfig, rabbitmqConfig, authConfig],
    }),
    SharedAuthModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        publicKey: configService.getOrThrow<string>('auth.jwtPublicKey'),
      }),
    }),
    GolevelupRabbitMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.getOrThrow<string>('rabbitmq.url'),
          exchanges: [
            {
              name: 'quote_events',
              type: 'topic',
            },
          ],
          channels: {
            default: {
              prefetchCount: configService.getOrThrow<number>(
                'rabbitmq.prefetchCount',
              ),
              default: true,
            },
          },
          enableControllerDiscovery: true,
          defaultRpcTimeout: 10000,
          connectionInitOptions: { wait: true },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('database.host'),
        port: configService.getOrThrow('database.port'),
        username: configService.getOrThrow('database.username'),
        password: configService.getOrThrow('database.password'),
        database: configService.getOrThrow('database.name'),
        entities: [QuoteRequest, ResponderAssignment],
        synchronize: configService.getOrThrow('database.synchronize'),
        logging: configService.getOrThrow('database.synchronize')
          ? 'all'
          : ['error', 'warn'],
      }),
    }),
    TypeOrmModule.forFeature([QuoteRequest, ResponderAssignment]),
  ],
  controllers: [QuoteController, HealthController],
  providers: [
    QuoteService,
    RabbitMQService,
    QuoteRequestRepository,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
