import { QuoteRequest } from '../entities/quote-request.entity';
import { VoyageData } from '../types';

export interface IQuoteRequestRepository {
  createQuoteRequest(requesterId: string, voyageData: VoyageData): Promise<QuoteRequest>;
  findByRequesterId(requesterId: string): Promise<QuoteRequest[]>;
  findWithResponderAssignments(quoteRequestId: string): Promise<QuoteRequest | null>;
  findActiveQuoteRequestsByResponderId(responderId: string): Promise<QuoteRequest[]>;
  save(quoteRequest: QuoteRequest): Promise<QuoteRequest>;
}
