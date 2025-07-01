import { Injectable } from '@nestjs/common';
import { VoyageData } from '../../domain/types';
import { QuoteRequest } from '../../domain/entities/quote-request.entity';
import { RabbitMQService } from '../../infrastructure/messaging/rabbitmq.service';
import { QuoteRequestRepository } from '@/infrastructure/persistence/quote-request.repository';

@Injectable()
export class QuoteService {
  constructor(
    private readonly quoteRequestRepository: QuoteRequestRepository,
    private readonly messagingService: RabbitMQService,
  ) {}

  async createQuoteRequest(requesterId: string, voyageData: VoyageData): Promise<QuoteRequest> {
    const quoteRequest = await this.quoteRequestRepository.createQuoteRequest(requesterId, voyageData);
    
    await this.messagingService.emit('quote_request.created', {
      quoteRequestId: quoteRequest.id,
      requesterId: quoteRequest.requesterId,
      voyageData: quoteRequest.voyageData,
    });

    return quoteRequest;
  }

  async findByRequesterId(requesterId: string): Promise<QuoteRequest[]> {
    return this.quoteRequestRepository.findByRequesterId(requesterId);
  }

  async assignResponder(quoteRequestId: string, responderId: string): Promise<QuoteRequest> {
    const quoteRequest = await this.getQuoteRequestById(quoteRequestId);
    
    quoteRequest.assignResponder(responderId);
    const updatedQuoteRequest = await this.quoteRequestRepository.save(quoteRequest);

    await this.messagingService.emit('quote_request.responder_assigned', {
      quoteRequestId,
      responderId,
    });

    return updatedQuoteRequest;
  }

  async submitResponse(
    quoteRequestId: string, 
    responderId: string, 
    price: number, 
    comments: string
  ): Promise<QuoteRequest> {
    const quoteRequest = await this.getQuoteRequestById(quoteRequestId);
    
    quoteRequest.submitResponse(responderId, price, comments);
    const updatedQuoteRequest = await this.quoteRequestRepository.save(quoteRequest);

    await this.messagingService.emit('quote_request.response_submitted', {
      quoteRequestId,
      responderId,
      price,
      comments,
    });

    return updatedQuoteRequest;
  }

  async completeQuoteRequest(quoteRequestId: string): Promise<QuoteRequest> {
    const quoteRequest = await this.getQuoteRequestById(quoteRequestId);
    
    quoteRequest.completeQuote();
    return this.quoteRequestRepository.save(quoteRequest);
  }

  async cancelQuoteRequest(quoteRequestId: string): Promise<QuoteRequest> {
    const quoteRequest = await this.getQuoteRequestById(quoteRequestId);
    
    quoteRequest.cancelQuote();
    return this.quoteRequestRepository.save(quoteRequest);
  }

  async findActiveQuoteRequestsByResponderId(responderId: string): Promise<QuoteRequest[]> {
    return this.quoteRequestRepository.findActiveQuoteRequestsByResponderId(responderId);
  }

  private async getQuoteRequestById(quoteRequestId: string): Promise<QuoteRequest> {
    const quoteRequest = await this.quoteRequestRepository.findWithResponderAssignments(quoteRequestId);
    if (!quoteRequest) {
      throw new Error(`Quote request with ID ${quoteRequestId} not found`);
    }
    return quoteRequest;
  }
}
