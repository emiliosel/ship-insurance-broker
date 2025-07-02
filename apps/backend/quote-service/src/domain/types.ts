export enum QuoteRequestStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_RESPONSE = 'PENDING_RESPONSE',
  RESPONDED = 'RESPONDED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum ResponseStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  RESPONDED = 'RESPONDED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum VesselType {
  CONTAINER_SHIP = 'CONTAINER_SHIP',
  BULK_CARRIER = 'BULK_CARRIER',
  TANKER = 'TANKER',
  CARGO = 'CARGO',
}

export enum CargoType {
  CONTAINER = 'CONTAINER',
  BULK = 'BULK',
  LIQUID = 'LIQUID',
  BREAKBULK = 'BREAKBULK',
}

export interface Port {
  code: string;
  name: string;
}

export interface VoyageData {
  departurePort: Port;
  destinationPort: Port;
  cargoType: CargoType;
  cargoWeight: number;
  vesselType: VesselType;
  departureDate: Date;
}

export interface QuoteResponse {
  responderId: string;
  price: number;
  comments: string;
  status: ResponseStatus;
}
