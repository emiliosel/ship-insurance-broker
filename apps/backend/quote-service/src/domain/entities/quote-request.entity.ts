import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude, Transform, TransformFnParams } from 'class-transformer';
import { ResponderAssignment } from './responder-assignment.entity';
import { VoyageData, QuoteRequestStatus } from '../types';
import {
  InvalidQuoteRequestStateException,
  QuoteRequestAlreadyFinalizedException,
  ResponderNotFoundException,
} from '../exceptions';

@Entity()
export class QuoteRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The company ID (tenant ID) of the requester
   */
  @Column()
  requesterId: string;

  @Column('jsonb')
  voyageData: VoyageData;

  @Column({
    type: 'enum',
    enum: QuoteRequestStatus,
    default: QuoteRequestStatus.PENDING,
  })
  status: QuoteRequestStatus;

  @OneToMany(
    () => ResponderAssignment,
    (assignment) => assignment.quoteRequest,
    {
      cascade: true,
      eager: true,
    },
  )
  @Transform(({ value }: TransformFnParams) =>
    Array.isArray(value)
      ? value.map((assignment: ResponderAssignment) => ({
          id: assignment.id,
          responderId: assignment.responderId,
          status: assignment.status,
          price: assignment.price,
          comments: assignment.comments,
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt,
        }))
      : (value as ResponderAssignment[]),
  )
  responderAssignments: ResponderAssignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  findResponder(responderId: string): ResponderAssignment | undefined {
    return this.responderAssignments.find(
      (assignment) => assignment.responderId === responderId,
    );
  }

  addResponders(responderIds: string[]): void {
    this.responderAssignments = responderIds.map((responderId) => {
      const assignment = new ResponderAssignment();
      assignment.responderId = responderId;
      assignment.quoteRequest = this;
      return assignment;
    });
  }

  acceptResponse(responderId: string): void {
    if (this.isFinalized()) {
      throw new QuoteRequestAlreadyFinalizedException(this.id);
    }

    const responder = this.findResponder(responderId);
    if (!responder) {
      throw new ResponderNotFoundException(this.id, responderId);
    }

    if (!responder.hasSubmittedResponse()) {
      throw new InvalidQuoteRequestStateException(
        this.id,
        this.status,
        QuoteRequestStatus.RESPONDED,
      );
    }

    this.status = QuoteRequestStatus.ACCEPTED;
    responder.accept();

    // Reject all other responses
    this.responderAssignments
      .filter((assignment) => assignment.responderId !== responderId)
      .forEach((assignment) => assignment.reject());
  }

  cancel(): void {
    if (this.isFinalized()) {
      throw new QuoteRequestAlreadyFinalizedException(this.id);
    }

    this.status = QuoteRequestStatus.CANCELLED;
    this.responderAssignments.forEach((assignment) => assignment.cancel());
  }

  isFinalized(): boolean {
    return [
      QuoteRequestStatus.ACCEPTED,
      QuoteRequestStatus.CANCELLED,
      QuoteRequestStatus.COMPLETED,
    ].includes(this.status);
  }
}
