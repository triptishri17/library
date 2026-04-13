import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from '../../schemas/book.schema';
import { CreateBookDto, UpdateBookDto, QueryBookDto } from './dto/book.dto';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

  async findAll(query: QueryBookDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { author: { $regex: query.search, $options: 'i' } },
        { isbn: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.available === 'true') filter.availableCopies = { $gt: 0 };

    const [books, total] = await Promise.all([
      this.bookModel
        .find(filter)
        .populate('categoryId', 'name slug')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.bookModel.countDocuments(filter),
    ]);

    return {
      data: books,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const book = await this.bookModel.findById(id).populate('categoryId', 'name slug');
    if (!book) throw new NotFoundException('Book not found');
    return { data: book };
  }

  async create(dto: CreateBookDto, coverImage?: string) {
    const existing = await this.bookModel.findOne({ isbn: dto.isbn });
    if (existing) throw new ConflictException('Book with this ISBN already exists');

    const book = await this.bookModel.create({
      ...dto,
      availableCopies: dto.totalCopies,
      coverImage,
    });
    return { data: book, message: 'Book added successfully' };
  }

  async update(id: string, dto: UpdateBookDto, coverImage?: string) {
    if (dto.isbn) {
      const existing = await this.bookModel.findOne({ isbn: dto.isbn, _id: { $ne: id } });
      if (existing) throw new ConflictException('ISBN already in use');
    }

    const updateData: any = { ...dto };
    if (coverImage) updateData.coverImage = coverImage;

    if (dto.totalCopies !== undefined) {
      const book = await this.bookModel.findById(id);
      if (!book) throw new NotFoundException('Book not found');
      const borrowedCopies = book.totalCopies - book.availableCopies;
      if (dto.totalCopies < borrowedCopies) {
        throw new BadRequestException(`Cannot reduce below ${borrowedCopies} (currently borrowed)`);
      }
      updateData.availableCopies = dto.totalCopies - borrowedCopies;
    }

    const book = await this.bookModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('categoryId', 'name slug');
    if (!book) throw new NotFoundException('Book not found');
    return { data: book, message: 'Book updated successfully' };
  }

  async remove(id: string) {
    const book = await this.bookModel.findById(id);
    if (!book) throw new NotFoundException('Book not found');
    if (book.availableCopies < book.totalCopies) {
      throw new BadRequestException('Cannot delete book with active borrows');
    }
    await this.bookModel.findByIdAndDelete(id);
    return { message: 'Book deleted successfully' };
  }

  async getStats() {
    const [total, available, borrowed] = await Promise.all([
      this.bookModel.countDocuments(),
      this.bookModel.countDocuments({ availableCopies: { $gt: 0 } }),
      this.bookModel.aggregate([
        { $group: { _id: null, totalBorrowed: { $sum: { $subtract: ['$totalCopies', '$availableCopies'] } } } },
      ]),
    ]);
    return {
      data: {
        totalBooks: total,
        availableBooks: available,
        borrowedCopies: borrowed[0]?.totalBorrowed || 0,
      },
    };
  }
}
