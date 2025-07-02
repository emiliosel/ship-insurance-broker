import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { NotificationService } from '../../application/services/notification.service';
import { VoyageData } from '../../domain/types';
import { Public } from '@quote-system/shared';

@Injectable()
export class QuoteEventsHandler {
  constructor(private readonly notificationService: NotificationService) {}

  @Public()
  @RabbitSubscribe({
    exchange: 'quote_events',
    routingKey: 'quote_request.created',
  })
  async handleQuoteRequestCreated(message: {
    quoteRequestId: string;
    requesterId: string;
    responderIds: string[];
    voyageData: VoyageData;
  }): Promise<void> {
    await this.notificationService.handleQuoteRequestCreated(
      message.quoteRequestId,
      message.requesterId,
      message.responderIds,
      message.voyageData,
    );
  }

  @Public()
  @RabbitSubscribe({
    exchange: 'quote_events',
    routingKey: 'quote_request.response_submitted',
  })
  async handleQuoteResponseSubmitted(message: {
    quoteRequestId: string;
    responderId: string;
    price: number;
    comments: string;
  }): Promise<void> {
    await this.notificationService.handleQuoteResponseSubmitted(
      message.quoteRequestId,
      message.responderId,
      message.price,
      message.comments,
    );
  }

  @Public()
  @RabbitSubscribe({
    exchange: 'quote_events',
    routingKey: 'quote_request.response_accepted',
  })
  async handleQuoteResponseAccepted(message: {
    quoteRequestId: string;
    responderId: string;
    rejectedResponderIds: string[];
  }): Promise<void> {
    await this.notificationService.handleQuoteResponseAccepted(
      message.quoteRequestId,
      message.responderId,
      message.rejectedResponderIds,
    );
  }

  @Public()
  @RabbitSubscribe({
    exchange: 'quote_events',
    routingKey: 'quote_request.response_cancelled',
  })
  async handleQuoteRequestCancelled(message: {
    quoteRequestId: string;
    responderIds: string[];
  }): Promise<void> {
    await this.notificationService.handleQuoteRequestCancelled(
      message.quoteRequestId,
      message.responderIds,
    );
  }
}
