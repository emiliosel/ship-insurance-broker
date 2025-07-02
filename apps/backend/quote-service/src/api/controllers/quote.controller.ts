import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { QuoteService } from '../../application/services/quote.service';
import { CreateQuoteRequestDto } from '../dto/create-quote-request.dto';
import { QuoteRequest } from '../../domain/entities/quote-request.entity';

@ApiTags('quote-requests')
@Controller('quote-requests')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quote request' })
  @ApiResponse({
    status: 201,
    description: 'The quote request has been successfully created.',
    type: QuoteRequest
  })
  async createQuoteRequest(@Body() dto: CreateQuoteRequestDto): Promise<QuoteRequest> {
    try {
      return await this.quoteService.createQuoteRequest(
        dto.requesterId,
        dto.voyageData.toVoyageData(),
        dto.responderIds
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('requester/:requesterId')
  @ApiOperation({ summary: 'Get all quote requests for a requester' })
  @ApiResponse({
    status: 200,
    description: 'List of quote requests for the requester',
    type: [QuoteRequest]
  })
  async getQuotesByRequesterId(@Param('requesterId') requesterId: string): Promise<QuoteRequest[]> {
    try {
      return await this.quoteService.findByRequesterId(requesterId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('responder/:responderId/pending')
  @ApiOperation({ summary: 'Get pending quote requests for a responder' })
  @ApiResponse({
    status: 200,
    description: 'List of pending quote requests for the responder',
    type: [QuoteRequest]
  })
  async getPendingQuotesByResponderId(@Param('responderId') responderId: string): Promise<QuoteRequest[]> {
    try {
      return await this.quoteService.findPendingByResponderId(responderId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':quoteRequestId/responses/:responderId')
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
      return await this.quoteService.setResponse(
        quoteRequestId,
        responderId,
        response.price,
        response.comments
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':quoteRequestId/accept/:responderId')
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
      return await this.quoteService.acceptResponse(quoteRequestId, responderId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':quoteRequestId')
  @ApiOperation({ summary: 'Cancel a quote request' })
  @ApiResponse({
    status: 200,
    description: 'The quote request has been successfully cancelled',
    type: QuoteRequest
  })
  async cancelQuoteRequest(@Param('quoteRequestId') quoteRequestId: string): Promise<QuoteRequest> {
    try {
      return await this.quoteService.cancelQuoteRequest(quoteRequestId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
