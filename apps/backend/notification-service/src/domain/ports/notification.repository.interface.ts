import { Notification } from '../entities/notification.entity';

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByTenantId(
    tenantId: string,
    limit?: number,
    offset?: number,
  ): Promise<Notification[]>;
  findByUserId(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<Notification[]>;
  findUnreadByUserId(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<Notification[]>;
  create(notification: Partial<Notification>): Promise<Notification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
}
