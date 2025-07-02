import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, HttpException, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@quote-system/shared';
import { QuoteService } from '../../application/services/quote.service';
import { CreateQuoteRequestDto } from '../dto/create-quote-request.dto';
import { QuoteRequest } from '../../domain/entities/quote-request.entity';
import { VoyageData } from '../../domain/types';

@ApiTags('quote-requests')
@Controller('quote-requests')
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @Roles('requester')
  @ApiOperation({ summary: 'Create a new quote request' })
  @ApiResponse({
    status: 201,
    description: 'The quote request has been successfully created.',
    type: QuoteRequest
  })
  async createQuoteRequest(@Body() dto: CreateQuoteRequestDto): Promise<QuoteRequest> {
    try {
      const voyageData: VoyageData = {
        ...dto.voyageData,
        departureDate: new Date(dto.voyageData.departureDate)
      };

      const quoteRequest = await this.quoteService.createQuoteRequest(
        dto.requesterId,
        voyageData,
        dto.responderIds
      );
      return quoteRequest;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('requester/:requesterId')
  @Roles('requester')
  @ApiOperation({ summary: 'Get all quote requests for a requester' })
  @ApiResponse({
    status: 200,
    description: 'List of quote requests for the requester',
    type: [QuoteRequest]
  })
  async getQuotesByRequesterId(@Param('requesterId') requesterId: string): Promise<QuoteRequest[]> {
    try {
      const quoteRequests = await this.quoteService.findByRequesterId(requesterId);
      return quoteRequests;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('responder/:responderId/pending')
  @Roles('responder')
  @ApiOperation({ summary: 'Get pending quote requests for a responder' })
  @ApiResponse({
    status: 200,
    description: 'List of pending quote requests for the responder',
    type: [QuoteRequest]
  })
  async getPendingQuotesByResponderId(@Param('responderId') responderId: string): Promise<QuoteRequest[]> {
    try {
      const quoteRequests = await this.quoteService.findPendingByResponderId(responderId);
      return quoteRequests;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':quoteRequestId/responses/:responderId')
  @Roles('responder')
  @ApiOperation({ summary: 'Submit a response to a quote request' })
  @ApiResponse({
    status: 200,
    description: 'The response has been successfully submitted',
    type: QuoteRequest
  })
  async setResponse(
    @Param('quoteRequestId') quoteRequestId: string,
    @Param('responderId') responderId: string,
    @Body() response: { price: number; comments: string }
  ): Promise<QuoteRequest> {
    try {
      const quoteRequest = await this.quoteService.setResponse(
        quoteRequestId,
        responderId,
        response.price,
        response.comments
      );
      return quoteRequest;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':quoteRequestId/accept/:responderId')
  @Roles('requester')
  @ApiOperation({ summary: 'Accept a response for a quote request' })
  @ApiResponse({
    status: 200,
    description: 'The response has been successfully accepted',
    type: QuoteRequest
  })
  async acceptResponse(
    @Param('quoteRequestId') quoteRequestId: string,
    @Param('responderId') responderId: string
  ): Promise<QuoteRequest> {
    try {
      const quoteRequest = await this.quoteService.acceptResponse(quoteRequestId, responderId);
      return quoteRequest;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':quoteRequestId')
  @Roles('requester')
  @ApiOperation({ summary: 'Cancel a quote request' })
  @ApiResponse({
    status: 200,
    description: 'The quote request has been successfully cancelled',
    type: QuoteRequest
  })  
  async cancelQuoteRequest(@Param('quoteRequestId') quoteRequestId: string): Promise<QuoteRequest> {
    try {
      const quoteRequest = await this.quoteService.cancelQuoteRequest(quoteRequestId);
      return quoteRequest;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
