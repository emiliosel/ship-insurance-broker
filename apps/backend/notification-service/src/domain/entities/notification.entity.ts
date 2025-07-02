import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  QUOTE_REQUEST_CREATED = 'QUOTE_REQUEST_CREATED',
  QUOTE_RESPONSE_SUBMITTED = 'QUOTE_RESPONSE_SUBMITTED',
  QUOTE_RESPONSE_ACCEPTED = 'QUOTE_RESPONSE_ACCEPTED',
  QUOTE_RESPONSE_REJECTED = 'QUOTE_RESPONSE_REJECTED',
  QUOTE_REQUEST_CANCELLED = 'QUOTE_REQUEST_CANCELLED',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  read: boolean;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  relatedEntityId: string;

  @CreateDateColumn()
  createdAt: Date;
}
