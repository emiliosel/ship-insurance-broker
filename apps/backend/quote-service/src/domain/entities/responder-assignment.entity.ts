import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuoteRequest } from './quote-request.entity';
import { IResponderAssignment } from '../interfaces';

@Entity('responder_assignments')
export class ResponderAssignment implements IResponderAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  responderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ default: false })
  hasResponded: boolean;

  @Column({ type: 'timestamp', nullable: true })
  responseDate: Date;

  @ManyToOne(() => QuoteRequest, quoteRequest => quoteRequest.responderAssignments)
  @JoinColumn({ name: 'quote_request_id' })
  quoteRequest: QuoteRequest;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  setResponse(price: number, comments: string): void {
    if (this.hasResponded) {
      throw new Error('Response has already been submitted');
    }

    this.price = price;
    this.comments = comments;
    this.hasResponded = true;
    this.responseDate = new Date();
  }
}
