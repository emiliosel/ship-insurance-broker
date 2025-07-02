import {
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsDateString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Port, CargoType, VesselType, VoyageData } from '../../domain/types';

export class PortDto implements Port {
  @ApiProperty({
    description: 'Port code',
    example: 'SGSIN',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Port name',
    example: 'Singapore',
  })
  @IsString()
  name: string;
}

export class VoyageDataDto {
  @ApiProperty({
    description: 'Departure port details',
    type: PortDto,
  })
  @ValidateNested()
  @Type(() => PortDto)
  departurePort: PortDto;

  @ApiProperty({
    description: 'Destination port details',
    type: PortDto,
  })
  @ValidateNested()
  @Type(() => PortDto)
  destinationPort: PortDto;

  @ApiProperty({
    description: 'Type of cargo',
    enum: CargoType,
  })
  @IsEnum(CargoType)
  cargoType: CargoType;

  @ApiProperty({
    description: 'Weight of cargo in metric tons',
    minimum: 0,
  })
  @IsNumber()
  cargoWeight: number;

  @ApiProperty({
    description: 'Type of vessel required',
    enum: VesselType,
  })
  @IsEnum(VesselType)
  vesselType: VesselType;

  @ApiProperty({
    description: 'Planned departure date',
    format: 'date-time',
  })
  @IsDateString()
  departureDate: string;

  toVoyageData(): VoyageData {
    return {
      departurePort: this.departurePort,
      destinationPort: this.destinationPort,
      cargoType: this.cargoType,
      cargoWeight: this.cargoWeight,
      vesselType: this.vesselType,
      departureDate: new Date(this.departureDate),
    };
  }
}

export class CreateQuoteRequestDto {
  @ApiProperty({
    description: 'Array of responder IDs',
    type: [String],
    format: 'uuid',
  })
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  responderIds: string[];

  @ApiProperty({
    description: 'Voyage details',
    type: VoyageDataDto,
  })
  @ValidateNested()
  @Type(() => VoyageDataDto)
  voyageData: VoyageDataDto;
}
