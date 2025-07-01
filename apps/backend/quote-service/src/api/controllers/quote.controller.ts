import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { QuoteService } from '../../application/services/quote.service';
import { CreateQuoteRequestDto } from '../dto/create-quote-request.dto';
import { QuoteRequest } from '../../domain/entities/quote-request.entity';

@Controller('quote-requests')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  async createQuoteRequest(
    @Body() createQuoteRequestDto: CreateQuoteRequestDto,
    @Body('requesterId') requesterId: string,
  ): Promise<QuoteRequest> {
    return this.quoteService.createQuoteRequest(requesterId, createQuoteRequestDto.toVoyageData());
  }

  @Post(':id/assign/:responderId')
  async assignResponder(
    @Param('id') quoteRequestId: string,
    @Param('responderId') responderId: string,
  ): Promise<QuoteRequest> {
    return this.quoteService.assignResponder(quoteRequestId, responderId);
  }

  @Post(':id/respond')
  async submitResponse(
    @Param('id') quoteRequestId: string,
    @Body('responderId') responderId: string,
    @Body('price') price: number,
    @Body('comments') comments: string,
  ): Promise<QuoteRequest> {
    return this.quoteService.submitResponse(quoteRequestId, responderId, price, comments);
  }

  @Patch(':id/complete')
  async completeQuoteRequest(
    @Param('id') quoteRequestId: string,
  ): Promise<QuoteRequest> {
    return this.quoteService.completeQuoteRequest(quoteRequestId);
  }

  @Patch(':id/cancel')
  async cancelQuoteRequest(
    @Param('id') quoteRequestId: string,
  ): Promise<QuoteRequest> {
    return this.quoteService.cancelQuoteRequest(quoteRequestId);
  }

  @Get('requester/:requesterId')
  async findByRequesterId(
    @Param('requesterId') requesterId: string,
  ): Promise<QuoteRequest[]> {
    return this.quoteService.findByRequesterId(requesterId);
  }

  @Get('responder/:responderId/active')
  async findActiveByResponderId(
    @Param('responderId') responderId: string,
  ): Promise<QuoteRequest[]> {
    return this.quoteService.findActiveQuoteRequestsByResponderId(responderId);
  }
}
