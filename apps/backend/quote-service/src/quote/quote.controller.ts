import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  CreateQuoteRequestDto,
  SubmitQuoteResponseDto,
  UpdateQuoteStatusDto,
  ApiResponse as ApiResponseType,
} from '@quote-system/shared';

@ApiTags('quote-requests')
@Controller('quote-requests')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new quote request',
    description: 'Creates a new quote request and assigns it to selected responders',
  })
  @ApiBody({ type: CreateQuoteRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Quote request created successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async createQuoteRequest(@Body() dto: CreateQuoteRequestDto) {
    // TODO: Get requesterId from auth
    const requesterId = '123'; // Temporary mock ID
    return this.quoteService.createQuoteRequest(requesterId, dto);
  }

  @Post(':id/respond')
  @ApiOperation({
    summary: 'Submit a quote response',
    description: 'Submit a response to a quote request with pricing and comments',
  })
  @ApiParam({ name: 'id', description: 'Quote request ID' })
  @ApiBody({ type: SubmitQuoteResponseDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Quote response submitted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Quote request not found' })
  async submitQuoteResponse(
    @Param('id', ParseUUIDPipe) quoteRequestId: string,
    @Body() dto: SubmitQuoteResponseDto,
  ) {
    // TODO: Get responderId from auth
    const responderId = '456'; // Temporary mock ID
    return this.quoteService.submitQuoteResponse(responderId, quoteRequestId, dto);
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update quote request status',
    description: 'Update the status of a quote request (e.g., accept/reject)',
  })
  @ApiParam({ name: 'id', description: 'Quote request ID' })
  @ApiBody({ type: UpdateQuoteStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Quote request not found' })
  async updateQuoteStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuoteStatusDto,
  ) {
    return this.quoteService.updateQuoteStatus(id, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get quote request by ID',
    description: 'Retrieves a quote request with all its responder assignments',
  })
  @ApiParam({ name: 'id', description: 'Quote request ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Quote request found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Quote request not found' })
  async getQuoteRequest(@Param('id', ParseUUIDPipe) id: string) {
    return this.quoteService.findQuoteRequestById(id);
  }

  @Get('requester/me')
  @ApiOperation({
    summary: 'Get quotes created by current requester',
    description: 'Lists all quote requests created by the authenticated requester',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Quotes found' })
  async getRequesterQuotes() {
    // TODO: Get requesterId from auth
    const requesterId = '123'; // Temporary mock ID
    return this.quoteService.findQuotesByRequesterId(requesterId);
  }

  @Get('responder/me')
  @ApiOperation({
    summary: 'Get quotes assigned to current responder',
    description: 'Lists all quote requests assigned to the authenticated responder',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Quotes found' })
  async getResponderQuotes() {
    // TODO: Get responderId from auth
    const responderId = '456'; // Temporary mock ID
    return this.quoteService.findQuotesByResponderId(responderId);
  }

  @Get('responder/me/pending')
  @ApiOperation({
    summary: 'Get pending quotes for current responder',
    description: 'Lists all pending quote requests assigned to the authenticated responder',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pending quotes found' })
  async getPendingResponderQuotes() {
    // TODO: Get responderId from auth
    const responderId = '456'; // Temporary mock ID
    return this.quoteService.findPendingQuotesByResponderId(responderId);
  }
}
