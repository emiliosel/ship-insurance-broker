import { IsNotEmpty, IsString, IsNumber, IsDate, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { Port } from '../../domain/types';

class PortDto implements Port {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateQuoteRequestDto {
  @IsObject()
  @ValidateNested()
  @Type(() => PortDto)
  departurePort: Port;

  @IsObject()
  @ValidateNested()
  @Type(() => PortDto)
  destinationPort: Port;

  @IsString()
  @IsNotEmpty()
  cargoType: string;

  @IsNumber()
  @IsNotEmpty()
  cargoWeight: number;

  @IsDate()
  @Type(() => Date)
  departureDate: Date;
}
