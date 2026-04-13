import { Controller, Get, Post, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinesService } from './fines.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../schemas/user.schema';

@ApiTags('Fines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Get all fines' })
  findAll(@Query() query: any) {
    return this.finesService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.finesService.getStats();
  }

  @Get('my-fines')
  @ApiOperation({ summary: 'Get current user pending fines' })
  getMyFines(@CurrentUser('_id') userId: string) {
    return this.finesService.getUserPendingFines(userId.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.finesService.findOne(id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Pay a fine' })
  pay(@Param('id') id: string) {
    return this.finesService.payFine(id);
  }

  @Patch(':id/waive')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Waive a fine' })
  waive(@Param('id') id: string) {
    return this.finesService.waiveFine(id);
  }
}
