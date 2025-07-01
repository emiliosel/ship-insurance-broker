import { VoyageData } from './entities';

// Event payload interfaces
export interface QuoteCreatedEvent {
  quoteRequestId: string;
  requesterId: string;
  responderIds: string[];
  voyageData: VoyageData;
}

export interface QuoteRespondedEvent {
  quoteRequestId: string;
  responderId: string;
  premium: number;
  comments?: string;
}

export interface QuoteStatusUpdatedEvent {
  quoteRequestId: string;
  status: string;
  reason?: string;
}

// Generic message interface
export interface Message<T = any> {
  id: string;
  type: string;
  data: T;
  metadata: {
    timestamp: Date;
    correlationId: string;
  };
}

// API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
