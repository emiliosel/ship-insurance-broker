import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  HttpException,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles, User } from '@quote-system/shared';
import { QuoteService } from '../../application/services/quote.service';
import { CreateQuoteRequestDto } from '../dto/create-quote-request.dto';
import { QuoteRequest } from '../../domain/entities/quote-request.entity';
import { VoyageData } from '../../domain/types';
import {
  QuoteResponseDto,
  SetQuoteResponseDto,
} from '../dto/quote-response.dto';

/**
 * Controller for quote request operations with tenant isolation
 *
 * This controller implements tenant isolation by:
 * 1. Using JwtAuthGuard to extract the authenticated user with company ID (tenant ID)
 * 2. Using RolesGuard to enforce role-based access control
 * 3. Passing the company ID from the JWT token to service methods
 * 4. Filtering data by company ID to ensure users only see their own data
 */

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
    type: QuoteRequest,
  })
  async createQuoteRequest(
    @Body() dto: CreateQuoteRequestDto,
    @Req() request: any,
  ): Promise<QuoteRequest> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    const voyageData: VoyageData = {
      ...dto.voyageData,
      departureDate: new Date(dto.voyageData.departureDate),
    };

    const quoteRequest = await this.quoteService.createQuoteRequest(
      user.companyId, // Use companyId instead of user.id
      voyageData,
      dto.responderIds,
    );
    return quoteRequest;
  }

  @Get('my-requests')
  @Roles('requester')
  @ApiOperation({ summary: 'Get all quote requests for the current requester' })
  @ApiResponse({
    status: 200,
    description: 'List of quote requests for the requester',
    type: [QuoteRequest],
  })
  async getMyQuoteRequests(@Req() request: any): Promise<QuoteRequest[]> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    const quoteRequests = await this.quoteService.findByRequesterId(
      user.companyId,
    );
    return quoteRequests;
  }

  @Get('my-pending-requests')
  @Roles('responder')
  @ApiOperation({
    summary: 'Get pending quote requests for the current responder',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending quote requests for the responder',
    type: [QuoteRequest],
  })
  async getMyPendingQuoteRequests(
    @Req() request: any,
  ): Promise<QuoteRequest[]> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    const quoteRequests = await this.quoteService.findPendingByResponderId(
      user.companyId,
    );
    return quoteRequests;
  }

  @Put(':quoteRequestId/response')
  @Roles('responder')
  @ApiOperation({ summary: 'Submit a response to a quote request' })
  @ApiResponse({
    status: 200,
    description: 'The response has been successfully submitted',
    type: QuoteRequest,
  })
  async setResponse(
    @Param('quoteRequestId') quoteRequestId: string,
    @Body() response: SetQuoteResponseDto,
    @Req() request: any,
  ): Promise<QuoteRequest> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    const quoteRequest = await this.quoteService.setResponse(
      quoteRequestId,
      user.companyId,
      response.price,
      response.comments,
    );
    return quoteRequest;
  }

  @Put(':quoteRequestId/accept/:responderId')
  @Roles('requester')
  @ApiOperation({ summary: 'Accept a response for a quote request' })
  @ApiResponse({
    status: 200,
    description: 'The response has been successfully accepted',
    type: QuoteRequest,
  })
  async acceptResponse(
    @Param('quoteRequestId') quoteRequestId: string,
    @Param('responderId') responderId: string,
    @Req() request: any,
  ): Promise<QuoteRequest> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    // Pass the company ID to ensure tenant isolation
    const quoteRequest = await this.quoteService.acceptResponse(
      quoteRequestId,
      responderId,
      user.companyId,
    );
    return quoteRequest;
  }

  @Delete(':quoteRequestId')
  @Roles('requester')
  @ApiOperation({ summary: 'Cancel a quote request' })
  @ApiResponse({
    status: 200,
    description: 'The quote request has been successfully cancelled',
    type: QuoteRequest,
  })
  async cancelQuoteRequest(
    @Param('quoteRequestId') quoteRequestId: string,
    @Req() request: any,
  ): Promise<QuoteRequest> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    // Pass the company ID to ensure tenant isolation
    const quoteRequest = await this.quoteService.cancelQuoteRequest(
      quoteRequestId,
      user.companyId,
    );
    return quoteRequest;
  }
}
