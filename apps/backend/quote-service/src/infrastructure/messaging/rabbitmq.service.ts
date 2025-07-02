import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { VoyageData, QuoteRequestStatus, ResponseStatus } from '../../domain/types';
import { EventPayloads, IMessagingService } from '../../domain/ports/messaging.service.interface';

@Injectable()
export class RabbitMQService implements IMessagingService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async emit<K extends keyof EventPayloads>(routingKey: K, data: EventPayloads[K]): Promise<void> {
    try {
      await this.amqpConnection.publish('quote_events', routingKey, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`Message published to ${routingKey}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to ${routingKey}:`, error);
      throw new Error(`Failed to publish message: ${error.message}`);
    }
  }

  // Listener examples for future use
  async onQuoteRequestCreated(data: {
    quoteRequestId: string;
    responderId: string;
    voyageData: VoyageData;
  }) {
    this.logger.log(`Received quote request created event: ${JSON.stringify(data)}`);
  }

  async onQuoteResponseSubmitted(data: {
    quoteRequestId: string;
    responderId: string;
    price: number;
    comments: string;
  }) {
    this.logger.log(`Received quote response submitted event: ${JSON.stringify(data)}`);
  }

  async onQuoteRequestDecision(data: {
    quoteRequestId: string;
    responderId: string;
    accepted: boolean;
  }) {
    this.logger.log(`Received quote request decision event: ${JSON.stringify(data)}`);
  }

  async onQuoteRequestCancelled(data: {
    quoteRequestId: string;
    responderId: string;
  }) {
    this.logger.log(`Received quote request cancelled event: ${JSON.stringify(data)}`);
  }
}
