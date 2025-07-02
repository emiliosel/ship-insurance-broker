import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EventPayloads, IMessagingService } from '../../domain/events';

@Injectable()
export class RabbitMQService implements IMessagingService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async emit<K extends keyof EventPayloads>(
    routingKey: K,
    data: EventPayloads[K],
  ): Promise<void> {
    try {
      await this.amqpConnection.publish('quote_events', routingKey, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`Message published to ${routingKey}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to publish message to ${routingKey}:`, error);
      throw new Error(
        `Failed to publish message: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
