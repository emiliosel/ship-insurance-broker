import { Injectable, Logger } from '@nestjs/common';
import { QuoteRequest } from '../../domain/entities/quote-request.entity';
import { VoyageData } from '../../domain/types';
import { QuoteRequestRepository } from '../../infrastructure/persistence/quote-request.repository';
import { RabbitMQService } from '../../infrastructure/messaging/rabbitmq.service';
import {
  QuoteRequestNotFoundException,
  ResponderNotFoundException,
  InvalidQuoteRequestStateException,
  QuoteRequestAlreadyFinalizedException,
  QuoteResponseAlreadySubmittedException
} from '../../domain/exceptions';

@Injectable()
export class QuoteService {
  private readonly logger = new Logger(QuoteService.name);

  constructor(
    private readonly quoteRequestRepository: QuoteRequestRepository,
    private readonly messagingService: RabbitMQService
  ) {}

  async createQuoteRequest(
    requesterId: string,
    voyageData: VoyageData,
    responderIds: string[]
  ): Promise<QuoteRequest> {
    this.logger.debug(`Creating quote request for requester: ${requesterId}`);
    
    const quoteRequest = await this.quoteRequestRepository.create(
      requesterId,
      voyageData,
      responderIds
    );

    await this.messagingService.emit('quote_request.created', {
      quoteRequestId: quoteRequest.id,
      requesterId,
      responderIds,
      voyageData
    });

    return quoteRequest;
  }

  async findByRequesterId(requesterId: string): Promise<QuoteRequest[]> {
    this.logger.debug(`Finding quote requests for requester: ${requesterId}`);
    return this.quoteRequestRepository.findByRequesterId(requesterId);
  }

  async findPendingByResponderId(responderId: string): Promise<QuoteRequest[]> {
    this.logger.debug(`Finding pending quote requests for responder: ${responderId}`);
    return this.quoteRequestRepository.findPendingByResponderId(responderId);
  }

  async setResponse(
    quoteRequestId: string,
    responderId: string,
    price: number,
    comments: string
  ): Promise<QuoteRequest> {
    this.logger.debug(`Setting response for quote request: ${quoteRequestId}, responder: ${responderId}`);

    const quoteRequest = await this.quoteRequestRepository.findById(quoteRequestId);
    if (!quoteRequest) {
      throw new QuoteRequestNotFoundException(quoteRequestId);
    }

    const responder = quoteRequest.findResponder(responderId);
    if (!responder) {
      throw new ResponderNotFoundException(quoteRequestId, responderId);
    }

    if (responder.hasSubmittedResponse()) {
      throw new QuoteResponseAlreadySubmittedException(responderId);
    }

    responder.submitResponse(price, comments);
    const updatedQuoteRequest = await this.quoteRequestRepository.save(quoteRequest);

    await this.messagingService.emit('quote_request.response_submitted', {
      quoteRequestId,
      responderId,
      price,
      comments
    });

    return updatedQuoteRequest;
  }

  async acceptResponse(quoteRequestId: string, responderId: string): Promise<QuoteRequest> {
    this.logger.debug(`Accepting response for quote request: ${quoteRequestId}, responder: ${responderId}`);

    const quoteRequest = await this.quoteRequestRepository.findById(quoteRequestId);
    if (!quoteRequest) {
      throw new QuoteRequestNotFoundException(quoteRequestId);
    }

    const responder = quoteRequest.findResponder(responderId);
    if (!responder) {
      throw new ResponderNotFoundException(quoteRequestId, responderId);
    }

    if (quoteRequest.isFinalized()) {
      throw new QuoteRequestAlreadyFinalizedException(quoteRequestId);
    }

    if (!responder.hasSubmittedResponse()) {
      throw new InvalidQuoteRequestStateException(quoteRequestId, 'PENDING', 'RESPONDED');
    }

    quoteRequest.acceptResponse(responderId);
    const updatedQuoteRequest = await this.quoteRequestRepository.save(quoteRequest);

    await this.messagingService.emit('quote_request.response_accepted', {
      quoteRequestId,
      responderId,
      rejectedResponderIds: quoteRequest.responderAssignments.filter(r => r.id === responderId).map(r => r.id)
    });

    return updatedQuoteRequest;
  }

  async cancelQuoteRequest(quoteRequestId: string): Promise<QuoteRequest> {
    this.logger.debug(`Cancelling quote request: ${quoteRequestId}`);

    const quoteRequest = await this.quoteRequestRepository.findById(quoteRequestId);
    if (!quoteRequest) {
      throw new QuoteRequestNotFoundException(quoteRequestId);
    }

    if (quoteRequest.isFinalized()) {
      throw new QuoteRequestAlreadyFinalizedException(quoteRequestId);
    }

    quoteRequest.cancel();
    const updatedQuoteRequest = await this.quoteRequestRepository.save(quoteRequest);

    await this.messagingService.emit('quote_request.cancelled', {
      quoteRequestId,
      responderIds: quoteRequest.responderAssignments.map(r => r.id)
    });

    return updatedQuoteRequest;
  }
}
