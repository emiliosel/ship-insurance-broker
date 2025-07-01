import { IsString, IsEnum, IsUUID, IsOptional, IsNumber, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VoyageData, QuoteRequestStatus, ResponderAssignmentStatus } from './entities';

export class VesselDto {
  @IsString()
  name: string;

  @IsString()
  imoNumber: string;

  @IsString()
  type: string;
}

export class CargoDto {
  @IsString()
  type: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;
}

export class RouteDto {
  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsDate()
  @Type(() => Date)
  departureDate: Date;

  @IsDate()
  @Type(() => Date)
  arrivalDate: Date;
}

export class VoyageDataDto implements VoyageData {
  @ValidateNested()
  @Type(() => VesselDto)
  vessel: VesselDto;

  @ValidateNested()
  @Type(() => CargoDto)
  cargo: CargoDto;

  @ValidateNested()
  @Type(() => RouteDto)
  route: RouteDto;
}

export class CreateQuoteRequestDto {
  @ValidateNested()
  @Type(() => VoyageDataDto)
  voyageData: VoyageDataDto;

  @IsUUID('4', { each: true })
  responderIds: string[];
}

export class UpdateQuoteStatusDto {
  @IsEnum(QuoteRequestStatus)
  status: QuoteRequestStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class SubmitQuoteResponseDto {
  @IsNumber()
  premium: number;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsEnum(ResponderAssignmentStatus)
  status: ResponderAssignmentStatus;
}

export class PaginationParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
