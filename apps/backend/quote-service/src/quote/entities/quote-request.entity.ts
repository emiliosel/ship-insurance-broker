import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuoteRequestStatus, ResponderAssignmentStatus, VoyageData } from '@quote-system/shared';

@Entity('quote_requests')
export class QuoteRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  requesterId: string;

  @Column({
    type: 'enum',
    enum: QuoteRequestStatus,
    default: QuoteRequestStatus.DRAFT,
  })
  status: QuoteRequestStatus;

  @Column('jsonb')
  voyageData: VoyageData;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('responder_assignments')
export class ResponderAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  quoteRequestId: string;

  @Column('uuid')
  responderId: string;

  @Column({
    type: 'enum',
    enum: ResponderAssignmentStatus,
    default: ResponderAssignmentStatus.PENDING,
  })
  status: ResponderAssignmentStatus;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  premium?: number;

  @Column('text', { nullable: true })
  comments?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
