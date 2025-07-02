import { Injectable, Logger } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { QuoteRequest } from '../../domain/entities/quote-request.entity';
import { ResponderAssignment } from '../../domain/entities/responder-assignment.entity';
import { VoyageData, QuoteRequestStatus } from '../../domain/types';
import { IQuoteRequestRepository } from '../../domain/ports/quote-request.repository.interface';

@Injectable()
export class QuoteRequestRepository implements IQuoteRequestRepository {
  private readonly repository: Repository<QuoteRequest>;
  private readonly logger = new Logger(QuoteRequestRepository.name);

  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(QuoteRequest);
  }

  async create(
    requesterId: string,
    voyageData: VoyageData,
    responderIds: string[]
  ): Promise<QuoteRequest> {
    const quoteRequest = new QuoteRequest();
    quoteRequest.requesterId = requesterId;
    quoteRequest.voyageData = voyageData;
    quoteRequest.status = QuoteRequestStatus.PENDING;
    quoteRequest.addResponders(responderIds);

    try {
      return await this.repository.save(quoteRequest);
    } catch (error) {
      this.logger.error(`Failed to create quote request: ${error.message}`, error.stack);
      throw new Error('Failed to create quote request');
    }
  }

  async findById(id: string): Promise<QuoteRequest | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['responderAssignments']
      });
    } catch (error) {
      this.logger.error(`Failed to find quote request by ID ${id}: ${error.message}`, error.stack);
      throw new Error('Failed to find quote request');
    }
  }

  async findByRequesterId(requesterId: string): Promise<QuoteRequest[]> {
    try {
      return await this.repository.find({
        where: { requesterId },
        relations: ['responderAssignments'],
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Failed to find quote requests for requester ${requesterId}: ${error.message}`, error.stack);
      throw new Error('Failed to find quote requests');
    }
  }

  async findPendingByResponderId(responderId: string): Promise<QuoteRequest[]> {
    try {
      return await this.repository
        .createQueryBuilder('quoteRequest')
        .leftJoinAndSelect('quoteRequest.responderAssignments', 'responderAssignment')
        .where('responderAssignment.responderId = :responderId', { responderId })
        .andWhere('responderAssignment.status = :status', { status: QuoteRequestStatus.PENDING })
        .orderBy('quoteRequest.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(`Failed to find pending quote requests for responder ${responderId}: ${error.message}`, error.stack);
      throw new Error('Failed to find pending quote requests');
    }
  }

  async save(quoteRequest: QuoteRequest): Promise<QuoteRequest> {
    try {
      return await this.repository.save(quoteRequest);
    } catch (error) {
      this.logger.error(`Failed to save quote request ${quoteRequest.id}: ${error.message}`, error.stack);
      throw new Error('Failed to save quote request');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.logger.error(`Failed to delete quote request ${id}: ${error.message}`, error.stack);
      throw new Error('Failed to delete quote request');
    }
  }
}
