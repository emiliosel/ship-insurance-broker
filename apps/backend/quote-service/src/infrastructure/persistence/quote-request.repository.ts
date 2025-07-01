import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteRequest } from '../../domain/entities/quote-request.entity';
import { VoyageData } from '../../domain/types';
import { IQuoteRequestRepository } from '../../domain/ports/quote-request.repository.interface';

@Injectable()
export class QuoteRequestRepository implements IQuoteRequestRepository {
  constructor(
    @InjectRepository(QuoteRequest)
    private readonly repository: Repository<QuoteRequest>,
  ) {}

  async createQuoteRequest(requesterId: string, voyageData: VoyageData): Promise<QuoteRequest> {
    const quoteRequest = new QuoteRequest();
    quoteRequest.requesterId = requesterId;
    quoteRequest.voyageData = voyageData;
    return this.repository.save(quoteRequest);
  }

  async findByRequesterId(requesterId: string): Promise<QuoteRequest[]> {
    return this.repository.find({
      where: { requesterId },
      relations: ['responderAssignments'],
      order: { createdAt: 'DESC' }
    });
  }

  async findWithResponderAssignments(quoteRequestId: string): Promise<QuoteRequest | null> {
    return this.repository.findOne({
      where: { id: quoteRequestId },
      relations: ['responderAssignments'],
    });
  }

  async findActiveQuoteRequestsByResponderId(responderId: string): Promise<QuoteRequest[]> {
    return this.repository.createQueryBuilder('quoteRequest')
      .leftJoinAndSelect('quoteRequest.responderAssignments', 'assignment')
      .where('assignment.responderId = :responderId', { responderId })
      .andWhere('quoteRequest.status NOT IN (:...statuses)', {
        statuses: ['COMPLETED', 'CANCELLED']
      })
      .orderBy('quoteRequest.createdAt', 'DESC')
      .getMany();
  }

  async save(quoteRequest: QuoteRequest): Promise<QuoteRequest> {
    return this.repository.save(quoteRequest);
  }
}
