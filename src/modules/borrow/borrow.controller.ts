import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BorrowService } from './borrow.service';
import { IssueBookDto, ReturnBookDto, RenewBookDto, QueryBorrowDto } from './dto/borrow.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../schemas/user.schema';

@ApiTags('Borrow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('borrow')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post('issue')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Issue a book to a user' })
  issue(@Body() dto: IssueBookDto) {
    return this.borrowService.issueBook(dto);
  }

  @Post('return')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Return a borrowed book' })
  returnBook(@Body() dto: ReturnBookDto) {
    return this.borrowService.returnBook(dto);
  }

  @Post('renew')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Renew a borrowed book' })
  renew(@Body() dto: RenewBookDto) {
    return this.borrowService.renewBook(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get borrow history' })
  getHistory(@Query() query: QueryBorrowDto, @CurrentUser() user: any) {
    if (user.role === UserRole.STUDENT) query.userId = user._id.toString();
    return this.borrowService.getHistory(query);
  }

  @Get('overdue')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  getOverdue() {
    return this.borrowService.getOverdueBooks();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  getStats() {
    return this.borrowService.getDashboardStats();
  }
}
