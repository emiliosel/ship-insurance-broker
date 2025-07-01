import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { IMessagingService } from '../../domain/ports/messaging.service.interface';

@Injectable()
export class RabbitMQService implements IMessagingService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async emit(event: string, data: any): Promise<void> {
    await this.amqpConnection.publish(
      'quote_events',  // exchange
      event,          // routing key
      data,
      { persistent: true }
    );
  }
}
