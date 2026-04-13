import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto, QueryBookDto } from './dto/book.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../schemas/user.schema';

const coverStorage = diskStorage({
  destination: './uploads/covers',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `cover-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@ApiTags('Books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all books with filters and pagination' })
  findAll(@Query() query: QueryBookDto) {
    return this.booksService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  getStats() {
    return this.booksService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('coverImage', { storage: coverStorage }))
  create(@Body() dto: CreateBookDto, @UploadedFile() file?: Express.Multer.File) {
    const coverImage = file ? `/uploads/covers/${file.filename}` : undefined;
    return this.booksService.create(dto, coverImage);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('coverImage', { storage: coverStorage }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const coverImage = file ? `/uploads/covers/${file.filename}` : undefined;
    return this.booksService.update(id, dto, coverImage);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
