import { IsString, IsNumber, IsUUID, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetQuoteResponseDto {
  @ApiProperty({
    description: 'Proposed price for the shipping service',
    minimum: 0,
    example: 50000
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Additional comments or terms for the quote',
    maxLength: 1000,
    example: 'Price includes fuel surcharge and port fees'
  })
  @IsString()
  @MaxLength(1000)
  comments: string;
}

export class QuoteResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the response',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: 'ID of the quote request this response is for',
    format: 'uuid'
  })
  quoteRequestId: string;

  @ApiProperty({
    description: 'ID of the responder',
    format: 'uuid'
  })
  responderId: string;

  @ApiProperty({
    description: 'Proposed price for the shipping service',
    minimum: 0,
    example: 50000
  })
  price: number;

  @ApiProperty({
    description: 'Additional comments or terms for the quote',
    example: 'Price includes fuel surcharge and port fees'
  })
  comments: string;

  @ApiProperty({
    description: 'Current status of the response',
    enum: ['PENDING', 'RESPONDED', 'ACCEPTED', 'REJECTED', 'CANCELLED']
  })
  status: string;

  @ApiProperty({
    description: 'Timestamp when the response was created',
    format: 'date-time'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the response was last updated',
    format: 'date-time'
  })
  updatedAt: Date;
}
