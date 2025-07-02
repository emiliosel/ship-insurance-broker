import { Injectable, Logger } from '@nestjs/common';
import {
  Notification,
  NotificationType,
} from '../../domain/entities/notification.entity';
import { VoyageData } from '../../domain/types';
import { NotificationRepository } from '@/infrastructure/persistence/notification.repository';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getNotificationsByTenantId(
    tenantId: string,
    limit?: number,
    offset?: number,
  ): Promise<Notification[]> {
    return this.notificationRepository.findByTenantId(tenantId, limit, offset);
  }

  async getNotificationsByUserId(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId, limit, offset);
  }

  async getUnreadNotificationsByUserId(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<Notification[]> {
    return this.notificationRepository.findUnreadByUserId(
      userId,
      limit,
      offset,
    );
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  // Event handlers for quote service events
  async handleQuoteRequestCreated(
    quoteRequestId: string,
    requesterId: string,
    responderIds: string[],
    voyageData: VoyageData,
  ): Promise<void> {
    this.logger.log(`Handling quote request created event: ${quoteRequestId}`);

    // Create notification for each responder
    for (const responderId of responderIds) {
      await this.createNotification({
        tenantId: responderId,
        userId: responderId,
        type: NotificationType.QUOTE_REQUEST_CREATED,
        title: 'New Quote Request',
        content: `You have received a new quote request for a voyage from ${voyageData.departurePort.name} to ${voyageData.destinationPort.name}`,
        relatedEntityId: quoteRequestId,
        metadata: {
          voyageData,
          requesterId,
        },
      });
    }
  }

  async handleQuoteResponseSubmitted(
    quoteRequestId: string,
    responderId: string,
    price: number,
    comments: string,
  ): Promise<void> {
    this.logger.log(
      `Handling quote response submitted event: ${quoteRequestId} by ${responderId}`,
    );

    // Get the requester ID from the related quote request
    // In a real implementation, you might need to fetch this from the quote service
    // For now, we'll assume it's in the metadata of a notification
    const notifications = await this.notificationRepository.findByTenantId(
      responderId,
      1,
    );
    const requesterId =
      notifications.length > 0
        ? (notifications[0].metadata?.requesterId as string)
        : null;

    if (!requesterId) {
      this.logger.error(
        `Could not find requesterId for quote request ${quoteRequestId}`,
      );
      return;
    }

    await this.createNotification({
      tenantId: requesterId,
      userId: requesterId,
      type: NotificationType.QUOTE_RESPONSE_SUBMITTED,
      title: 'Quote Response Received',
      content: `A responder has submitted a quote of $${price} for your request`,
      relatedEntityId: quoteRequestId,
      metadata: {
        responderId,
        price,
        comments,
      },
    });
  }

  async handleQuoteResponseAccepted(
    quoteRequestId: string,
    responderId: string,
    rejectedResponderIds: string[],
  ): Promise<void> {
    this.logger.log(
      `Handling quote response accepted event: ${quoteRequestId} for ${responderId}`,
    );

    // Notification for the accepted responder
    await this.createNotification({
      tenantId: responderId,
      userId: responderId,
      type: NotificationType.QUOTE_RESPONSE_ACCEPTED,
      title: 'Quote Response Accepted',
      content: 'Your quote response has been accepted',
      relatedEntityId: quoteRequestId,
    });

    // Notifications for rejected responders
    for (const rejectedResponderId of rejectedResponderIds) {
      await this.createNotification({
        tenantId: rejectedResponderId,
        userId: rejectedResponderId,
        type: NotificationType.QUOTE_RESPONSE_REJECTED,
        title: 'Quote Response Rejected',
        content: 'Your quote response has been rejected',
        relatedEntityId: quoteRequestId,
      });
    }
  }

  async handleQuoteRequestCancelled(
    quoteRequestId: string,
    responderIds: string[],
  ): Promise<void> {
    this.logger.log(
      `Handling quote request cancelled event: ${quoteRequestId}`,
    );

    // Notify all responders
    for (const responderId of responderIds) {
      await this.createNotification({
        tenantId: responderId,
        userId: responderId,
        type: NotificationType.QUOTE_REQUEST_CANCELLED,
        title: 'Quote Request Cancelled',
        content: 'A quote request you were assigned to has been cancelled',
        relatedEntityId: quoteRequestId,
      });
    }
  }

  private async createNotification(
    data: Partial<Notification>,
  ): Promise<Notification> {
    try {
      return await this.notificationRepository.create(data);
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
