import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from '../../application/services/notification.service';
import { Notification } from '../../domain/entities/notification.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, User } from '@quote-system/shared';
import { PaginationDto } from '../dtos/pagination.dto';

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('tenant')
  @ApiOperation({
    summary: 'Get notifications for the current tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of notifications for the current tenant',
    type: [Notification],
  })
  async getNotificationsForTenant(
    @Req() request: any,
    @Query() paginationDto: PaginationDto,
  ): Promise<Notification[]> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    return this.notificationService.getNotificationsByTenantId(
      user.companyId,
      paginationDto.limit,
      paginationDto.offset,
    );
  }
}
