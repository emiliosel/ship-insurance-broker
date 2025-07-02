import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  JwtAuthGuard,
  RolesGuard,
  SharedAuthModule,
} from '@quote-system/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQService } from './infrastructure/messaging/rabbitmq.service';
import { validate } from './config/env.validation';
import databaseConfig from './config/database.config';
import rabbitmqConfig from './config/rabbitmq.config';
import authConfig from './config/auth.config';
import { RabbitMQModule as GolevelupRabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { HealthController } from './api/controllers/health.controller';
import { Notification } from './domain/entities/notification.entity';
import { NotificationController } from './api/controllers/notification.controller';
import { NotificationService } from './application/services/notification.service';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { QuoteEventsHandler } from './infrastructure/messaging/quote-events.handler';

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
        console.log(
          'rabbitmq.url: ',
          configService.getOrThrow<string>('rabbitmq.url'),
        );

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
        entities: [Notification],
        synchronize: configService.getOrThrow('database.synchronize'),
        logging: 'all',
      }),
    }),
    TypeOrmModule.forFeature([Notification]),
    // RabbitMQService,
  ],
  controllers: [HealthController, NotificationController],
  providers: [
    NotificationService,
    RabbitMQService,
    NotificationRepository,
    QuoteEventsHandler,
    // {
    //   provide: 'INotificationRepository',
    //   useClass: NotificationRepository,
    // },
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
