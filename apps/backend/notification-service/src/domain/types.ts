export interface Port {
  code: string;
  name: string;
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

export interface VoyageData {
  departurePort: Port;
  destinationPort: Port;
  cargoType: CargoType;
  cargoWeight: number;
  vesselType: VesselType;
  departureDate: string;
}
