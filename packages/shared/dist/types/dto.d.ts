import { VoyageData, QuoteRequestStatus, ResponderAssignmentStatus } from './entities';
export declare class VesselDto {
    name: string;
    imoNumber: string;
    type: string;
}
export declare class CargoDto {
    type: string;
    quantity: number;
    unit: string;
}
export declare class RouteDto {
    origin: string;
    destination: string;
    departureDate: Date;
    arrivalDate: Date;
}
export declare class VoyageDataDto implements VoyageData {
    vessel: VesselDto;
    cargo: CargoDto;
    route: RouteDto;
}
export declare class CreateQuoteRequestDto {
    voyageData: VoyageDataDto;
    responderIds: string[];
}
export declare class UpdateQuoteStatusDto {
    status: QuoteRequestStatus;
    reason?: string;
}
export declare class SubmitQuoteResponseDto {
    premium: number;
    comments?: string;
    status: ResponderAssignmentStatus;
}
export declare class PaginationParams {
    page?: number;
    limit?: number;
}
