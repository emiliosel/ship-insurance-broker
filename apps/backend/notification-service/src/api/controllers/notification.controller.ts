import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
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

  @Get()
  @ApiOperation({ summary: 'Get notifications for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of notifications for the current user',
    type: [Notification],
  })
  async getNotifications(
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

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of unread notifications for the current user',
    type: [Notification],
  })
  async getUnreadNotifications(
    @Req() request: any,
    @Query() paginationDto: PaginationDto,
  ): Promise<Notification[]> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    return this.notificationService.getUnreadNotificationsByUserId(
      user.companyId,
      paginationDto.limit,
      paginationDto.offset,
    );
  }

  @Get('count-unread')
  @ApiOperation({ summary: 'Count unread notifications for the current user' })
  @ApiResponse({
    status: 200,
    description:
      'Returns the count of unread notifications for the current user',
    type: Number,
  })
  async countUnreadNotifications(
    @Req() request: any,
  ): Promise<{ count: number }> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    const tenantId = user.companyId;
    const count = await this.notificationService.countUnread(tenantId);
    return { count };
  }

  @Post(':id/mark-read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  async markAsRead(
    @Req() request: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    const tenantId = user.companyId;
    const notification =
      await this.notificationService.getNotificationsByTenantId(tenantId);

    // Check if the notification belongs to the user
    const userNotification = notification.find((n) => n.id === id);
    if (!userNotification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }
    await this.notificationService.markAsRead(id);
    return { success: true };
  }

  @Post('mark-all-read')
  @ApiOperation({
    summary: 'Mark all notifications as read for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  async markAllAsRead(@Req() request: any): Promise<{ success: boolean }> {
    const user: User = JwtAuthGuard.getCurrentUser(request);
    const tenantId = user.companyId;
    await this.notificationService.markAllAsRead(tenantId);
    return { success: true };
  }

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
