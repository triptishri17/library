import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IssueBookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Due date (default: 14 days from today)' })
  @IsString()
  @IsOptional()
  dueDate?: string;
}

export class ReturnBookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  borrowRecordId: string;
}

export class RenewBookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  borrowRecordId: string;

  @ApiPropertyOptional({ description: 'New due date (default: +14 days)' })
  @IsString()
  @IsOptional()
  newDueDate?: string;
}

export class QueryBorrowDto {
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
  @IsOptional() userId?: string;
  @IsOptional() status?: string;
}
