import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getMyNotifications(@CurrentUser('_id') userId: string, @Query() query: any) {
    return this.notificationsService.getUserNotifications(userId.toString(), query.page, query.limit);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser('_id') userId: string) {
    return this.notificationsService.markAllRead(userId.toString());
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser('_id') userId: string) {
    return this.notificationsService.markAsRead(id, userId.toString());
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('_id') userId: string) {
    return this.notificationsService.deleteNotification(id, userId.toString());
  }
}
