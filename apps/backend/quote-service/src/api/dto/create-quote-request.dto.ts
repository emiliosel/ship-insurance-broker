import { IsNotEmpty, IsString, IsNumber, IsISO8601 } from 'class-validator';
import { VoyageData, Port } from '../../domain/types';
import { Transform } from 'class-transformer';

export class CreateQuoteRequestDto {
  @IsNotEmpty()
  @IsString()
  departurePort: Port;

  @IsNotEmpty()
  @IsString()
  destinationPort: Port;

  @IsNotEmpty()
  @IsString()
  cargoType: string;

  @IsNotEmpty()
  @IsNumber()
  cargoWeight: number;

  @IsNotEmpty()
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  departureDate: string;

  toVoyageData(): VoyageData {
    return {
      departurePort: this.departurePort,
      destinationPort: this.destinationPort,
      cargoType: this.cargoType,
      cargoWeight: this.cargoWeight,
      departureDate: new Date(this.departureDate),
    };
  }
}
