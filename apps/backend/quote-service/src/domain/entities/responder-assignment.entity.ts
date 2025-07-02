import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { QuoteRequest } from './quote-request.entity';
import { ResponseStatus } from '../types';

@Entity()
export class ResponderAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The company ID (tenant ID) of the responder
   */
  @Column()
  responderId: string;

  @Column({
    type: 'enum',
    enum: ResponseStatus,
    default: ResponseStatus.PENDING
  })
  status: ResponseStatus;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column('text', { nullable: true })
  comments?: string;

  @ManyToOne(() => QuoteRequest, quoteRequest => quoteRequest.responderAssignments)
  quoteRequest: QuoteRequest;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  submitResponse(price: number, comments: string): void {
    if (this.status !== ResponseStatus.PENDING) {
      throw new Error('Response can only be submitted when in PENDING status');
    }

    this.price = price;
    this.comments = comments;
    this.status = ResponseStatus.SUBMITTED;
  }

  hasSubmittedResponse(): boolean {
    return this.status === ResponseStatus.SUBMITTED;
  }

  accept(): void {
    if (this.status !== ResponseStatus.SUBMITTED) {
      throw new Error('Only submitted responses can be accepted');
    }
    this.status = ResponseStatus.ACCEPTED;
  }

  reject(): void {
    if (this.status !== ResponseStatus.SUBMITTED) {
      throw new Error('Only submitted responses can be rejected');
    }
    this.status = ResponseStatus.REJECTED;
  }

  cancel(): void {
    if (this.status === ResponseStatus.ACCEPTED || this.status === ResponseStatus.REJECTED) {
      throw new Error('Cannot cancel a finalized response');
    }
    this.status = ResponseStatus.CANCELLED;
  }
}
