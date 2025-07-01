import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { VoyageData, QuoteRequestStatus } from '../types';
import { ResponderAssignment } from './responder-assignment.entity';
import { IQuoteRequest } from '../interfaces';

@Entity('quote_requests')
export class QuoteRequest implements IQuoteRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requesterId: string;

  @Column('jsonb')
  voyageData: VoyageData;

  @Column({
    type: 'enum',
    enum: QuoteRequestStatus,
    default: QuoteRequestStatus.PENDING
  })
  status: QuoteRequestStatus;

  @OneToMany(() => ResponderAssignment, assignment => assignment.quoteRequest, {
    cascade: true
  })
  responderAssignments: ResponderAssignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  assignResponder(responderId: string): void {
    if (this.status === QuoteRequestStatus.COMPLETED || 
        this.status === QuoteRequestStatus.CANCELLED) {
      throw new Error('Cannot assign responders to a finalized quote request');
    }

    const newAssignment = new ResponderAssignment();
    newAssignment.responderId = responderId;
    newAssignment.quoteRequest = this;
    
    if (!this.responderAssignments) {
      this.responderAssignments = [];
    }
    
    if (this.responderAssignments.find(a => a.responderId === responderId)) {
      throw new Error('Responder already assigned to this quote request');
    }

    this.responderAssignments.push(newAssignment);
    this.updateStatus(QuoteRequestStatus.IN_PROGRESS);
  }

  submitResponse(responderId: string, price: number, comments: string): void {
    if (this.status === QuoteRequestStatus.COMPLETED || 
        this.status === QuoteRequestStatus.CANCELLED) {
      throw new Error('Cannot submit response to a finalized quote request');
    }

    const assignment = this.responderAssignments?.find(a => a.responderId === responderId);
    
    if (!assignment) {
      throw new Error('Responder not assigned to this quote request');
    }

    assignment.setResponse(price, comments);
  }

  updateStatus(newStatus: QuoteRequestStatus): void {
    if (this.status === QuoteRequestStatus.COMPLETED || 
        this.status === QuoteRequestStatus.CANCELLED) {
      throw new Error('Cannot update status of a finalized quote request');
    }
    this.status = newStatus;
  }

  completeQuote(): void {
    if (this.status === QuoteRequestStatus.CANCELLED) {
      throw new Error('Cannot complete a cancelled quote request');
    }
    this.status = QuoteRequestStatus.COMPLETED;
  }

  cancelQuote(): void {
    if (this.status === QuoteRequestStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed quote request');
    }
    this.status = QuoteRequestStatus.CANCELLED;
  }
}
