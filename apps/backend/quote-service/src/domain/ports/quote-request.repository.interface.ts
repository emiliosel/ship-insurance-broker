import { QuoteRequest } from '../entities/quote-request.entity';
import { VoyageData } from '../types';

export interface IQuoteRequestRepository {
  /**
   * Creates a new quote request
   * 
   * @param requesterId The company ID (tenant ID) of the requester
   * @param voyageData The voyage data for the quote request
   * @param responderIds Array of company IDs (tenant IDs) of the responders
   * @returns The created quote request
   */
  create(
    requesterId: string,
    voyageData: VoyageData,
    responderIds: string[]
  ): Promise<QuoteRequest>;
  
  /**
   * Finds a quote request by ID
   * 
   * @param id The ID of the quote request
   * @returns The quote request or null if not found
   */
  findById(id: string): Promise<QuoteRequest | null>;
  
  /**
   * Finds all quote requests for a requester company
   * 
   * @param requesterId The company ID (tenant ID) of the requester
   * @returns Array of quote requests
   */
  findByRequesterId(requesterId: string): Promise<QuoteRequest[]>;
  
  /**
   * Finds all pending quote requests for a responder company
   * 
   * @param responderId The company ID (tenant ID) of the responder
   * @returns Array of pending quote requests
   */
  findPendingByResponderId(responderId: string): Promise<QuoteRequest[]>;
  
  /**
   * Saves a quote request
   * 
   * @param quoteRequest The quote request to save
   * @returns The saved quote request
   */
  save(quoteRequest: QuoteRequest): Promise<QuoteRequest>;
  
  /**
   * Deletes a quote request
   * 
   * @param id The ID of the quote request to delete
   */
  delete(id: string): Promise<void>;
}
