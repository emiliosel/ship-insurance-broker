export enum QuoteRequestStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  RESPONDED = "RESPONDED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum ResponderAssignmentStatus {
  PENDING = "PENDING",
  RESPONDED = "RESPONDED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface VoyageData {
  vessel: {
    name: string;
    imoNumber: string;
    type: string;
  };
  cargo: {
    type: string;
    quantity: number;
    unit: string;
  };
  route: {
    origin: string;
    destination: string;
    departureDate: Date;
    arrivalDate: Date;
  };
}

export interface QuoteRequest {
  id: string;
  requesterId: string;
  status: QuoteRequestStatus;
  voyageData: VoyageData;
  createdAt: Date;
  updatedAt: Date;
  responderAssignments?: ResponderAssignment[];
}

export interface ResponderAssignment {
  id: string;
  quoteRequestId: string;
  responderId: string;
  status: ResponderAssignmentStatus;
  premium?: number;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}
