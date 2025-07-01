import { Injectable, NotFoundException } from '@nestjs/common';
import { QuoteRequestRepository } from './repositories/quote-request.repository';
import { ResponderAssignmentRepository } from './repositories/responder-assignment.repository';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import {
  CreateQuoteRequestDto,
  SubmitQuoteResponseDto,
  UpdateQuoteStatusDto,
  QuoteRequestStatus,
  VoyageData,
  ResponderAssignmentStatus,
} from '@quote-system/shared';

@Injectable()
export class QuoteService {
  constructor(
    private readonly quoteRequestRepository: QuoteRequestRepository,
    private readonly responderAssignmentRepository: ResponderAssignmentRepository,
    private readonly rabbitmqService: RabbitMQService,
  ) {}

  async createQuoteRequest(
    requesterId: string,
    dto: CreateQuoteRequestDto,
  ) {
    const quoteRequest = await this.quoteRequestRepository.create(
      requesterId,
      dto.voyageData,
    );

    // Create responder assignments
    await this.responderAssignmentRepository.createMany(
      quoteRequest.id,
      dto.responderIds,
    );

    // Emit event for quote request creation
    await this.rabbitmqService.emit('quote.created', {
      quoteRequestId: quoteRequest.id,
      requesterId,
      responderIds: dto.responderIds,
      voyageData: dto.voyageData,
    });

    return quoteRequest;
  }

  async findQuoteRequestById(id: string) {
    const quoteRequest = await this.quoteRequestRepository.findWithResponderAssignments(id);
    if (!quoteRequest) {
      throw new NotFoundException(`Quote request with ID ${id} not found`);
    }
    return quoteRequest;
  }

  async submitQuoteResponse(
    responderId: string,
    quoteRequestId: string,
    dto: SubmitQuoteResponseDto,
  ) {
    const assignment = await this.responderAssignmentRepository.updateStatus(
      quoteRequestId,
      ResponderAssignmentStatus.RESPONDED,
      dto.premium,
      dto.comments,
    );

    await this.rabbitmqService.emit('quote.responded', {
      quoteRequestId,
      responderId,
      premium: dto.premium,
      comments: dto.comments,
    });

    return assignment;
  }

  async updateQuoteStatus(
    id: string,
    dto: UpdateQuoteStatusDto,
  ) {
    const quoteRequest = await this.quoteRequestRepository.updateStatus(id, dto.status);

    await this.rabbitmqService.emit('quote.status.updated', {
      quoteRequestId: id,
      status: dto.status,
      reason: dto.reason,
    });

    return quoteRequest;
  }

  async findQuotesByRequesterId(requesterId: string) {
    return this.quoteRequestRepository.findByRequesterId(requesterId);
  }

  async findQuotesByResponderId(responderId: string) {
    return this.responderAssignmentRepository.findByResponderId(responderId);
  }

  async findPendingQuotesByResponderId(responderId: string) {
    return this.responderAssignmentRepository.findPendingByResponderId(responderId);
  }
}
