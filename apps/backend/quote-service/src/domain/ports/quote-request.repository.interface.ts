import { QuoteRequest } from '../entities/quote-request.entity';
import { VoyageData } from '../types';

export interface IQuoteRequestRepository {
  create(
    requesterId: string,
    voyageData: VoyageData,
    responderIds: string[]
  ): Promise<QuoteRequest>;
  
  findById(id: string): Promise<QuoteRequest | null>;
  
  findByRequesterId(requesterId: string): Promise<QuoteRequest[]>;
  
  findPendingByResponderId(responderId: string): Promise<QuoteRequest[]>;
  
  save(quoteRequest: QuoteRequest): Promise<QuoteRequest>;
  
  delete(id: string): Promise<void>;
}
