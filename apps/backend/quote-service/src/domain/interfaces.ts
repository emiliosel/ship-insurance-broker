import { QuoteRequestStatus } from './types';

export interface IQuoteRequest {
  id: string;
  requesterId: string;
  status: QuoteRequestStatus;
}

export interface IResponderAssignment {
  id: string;
  responderId: string;
  price?: number;
  comments?: string;
  hasResponded: boolean;
  responseDate?: Date;
  quoteRequest: IQuoteRequest;
}
