import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteRequest } from '../entities/quote-request.entity';
import { QuoteRequestStatus, VoyageData } from '@quote-system/shared';

@Injectable()
export class QuoteRequestRepository {
  constructor(
    @InjectRepository(QuoteRequest)
    private readonly repository: Repository<QuoteRequest>,
  ) {}

  async create(
    requesterId: string,
    voyageData: VoyageData,
  ): Promise<QuoteRequest> {
    const quoteRequest = this.repository.create({
      requesterId,
      voyageData,
      status: QuoteRequestStatus.PENDING,
    });
    return this.repository.save(quoteRequest);
  }

  async findById(id: string): Promise<QuoteRequest | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findWithResponderAssignments(id: string): Promise<QuoteRequest | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['responderAssignments'],
    });
  }

  async findByRequesterId(requesterId: string): Promise<QuoteRequest[]> {
    return this.repository.find({
      where: { requesterId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    status: QuoteRequestStatus,
  ): Promise<QuoteRequest> {
    const quoteRequest = await this.repository.findOne({ where: { id } });
    if (!quoteRequest) {
      throw new Error('Quote request not found');
    }

    quoteRequest.status = status;
    return this.repository.save(quoteRequest);
  }
}
