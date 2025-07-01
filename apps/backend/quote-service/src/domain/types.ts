export enum QuoteRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Port {
  id: string;
  name: string;
  country: string;
}

export interface VoyageData {
  departurePort: Port;
  destinationPort: Port;
  cargoType: string;
  cargoWeight: number;
  departureDate: Date;
}

export interface QuoteResponse {
  price: number;
  comments: string;
  responderId: string;
  quoteRequestId: string;
}
