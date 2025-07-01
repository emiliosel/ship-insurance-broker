import { VoyageData } from './entities';
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
export interface Message<T = any> {
    id: string;
    type: string;
    data: T;
    metadata: {
        timestamp: Date;
        correlationId: string;
    };
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}
