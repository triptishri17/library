
import {
  IsNotEmpty, IsNumber, IsOptional, IsString, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer'; // ← add Transform

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  totalCopies: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  publishedYear?: number;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}

// ✅ THIS IS THE ONLY THING THAT NEEDED TO CHANGE
export class QueryBookDto {
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  limit?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || undefined) // "" → undefined
  search?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || undefined) // "" → undefined
  categoryId?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined) // "" → undefined
  available?: string;
}