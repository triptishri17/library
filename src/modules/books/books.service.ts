import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Book, BookDocument } from '../../schemas/book.schema';
import {
  CreateBookDto,
  UpdateBookDto,
  QueryBookDto,
} from './dto/book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: Model<BookDocument>,
  ) {}

  // ================================
  // SAFE OBJECTID CHECK
  // ================================
  private isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id) && /^[a-fA-F0-9]{24}$/.test(id);
  }

  // ================================
  // GET ALL BOOKS
  // ================================
  async findAll(query: QueryBookDto) 
  
  {console.log('RAW QUERY:', query);
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const filter: any = {};
      

      // SEARCH
      if (query.search) {
        filter.$or = [
          { title: { $regex: query.search, $options: 'i' } },
          { author: { $regex: query.search, $options: 'i' } },
          { isbn: { $regex: query.search, $options: 'i' } },
        ];
      }

      // CATEGORY FIX 🔥 (MAIN ISSUE SOLVED)
      // if (query.categoryId) {
      //   if (this.isValidObjectId(query.categoryId)) {
      //     filter.categoryId = new Types.ObjectId(query.categoryId);
      //   } else {
      //     console.warn('Invalid categoryId ignored:', query.categoryId);
      //   }
      // }

      // AVAILABLE
      if (query.available === 'true') {
        filter.availableCopies = { $gt: 0 };
      }

      const [books, total] = await Promise.all([
        this.bookModel
          .find(filter)
          // .populate('categoryId', 'name slug')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),

        this.bookModel.countDocuments(filter),
      ]);

      return {
        data: books,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('❌ FIND ALL ERROR:', error);
      throw new BadRequestException('Error fetching books');
    }
  }

  // ================================
  // SINGLE BOOK
  // ================================
  async findOne(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid book ID');
    }

    const book = await this.bookModel
      .findById(id)
      .populate('categoryId', 'name slug');

    if (!book) throw new NotFoundException('Book not found');

    return { data: book };
  }

  // ================================
  // CREATE
  // ================================
  async create(dto: CreateBookDto, coverImage?: string) {
    if (!this.isValidObjectId(dto.categoryId)) {
      throw new BadRequestException('Invalid categoryId');
    }

    const exists = await this.bookModel.findOne({ isbn: dto.isbn });
    if (exists) throw new ConflictException('ISBN already exists');

    const book = await this.bookModel.create({
      ...dto,
      categoryId: new Types.ObjectId(dto.categoryId),
      availableCopies: dto.totalCopies,
      coverImage,
    });

    return {
      data: book,
      message: 'Book created successfully',
    };
  }

  // ================================
  // UPDATE
  // ================================
  async update(id: string, dto: UpdateBookDto, coverImage?: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid book ID');
    }

    const updateData: any = { ...dto };

    if (dto.categoryId) {
      if (!this.isValidObjectId(dto.categoryId)) {
        throw new BadRequestException('Invalid categoryId');
      }
      updateData.categoryId = new Types.ObjectId(dto.categoryId);
    }

    if (dto.isbn) {
      const exists = await this.bookModel.findOne({
        isbn: dto.isbn,
        _id: { $ne: id },
      });

      if (exists) throw new ConflictException('ISBN already in use');
    }

    if (coverImage) updateData.coverImage = coverImage;

    if (dto.totalCopies !== undefined) {
      const book = await this.bookModel.findById(id);
      if (!book) throw new NotFoundException('Book not found');

      const borrowed = book.totalCopies - book.availableCopies;

      if (dto.totalCopies < borrowed) {
        throw new BadRequestException('Cannot reduce below borrowed copies');
      }

      updateData.availableCopies = dto.totalCopies - borrowed;
    }

    const updated = await this.bookModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw new NotFoundException('Book not found');

    return {
      data: updated,
      message: 'Book updated successfully',
    };
  }

  // ================================
  // DELETE
  // ================================
  async remove(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid book ID');
    }

    const book = await this.bookModel.findById(id);
    if (!book) throw new NotFoundException('Book not found');

    if (book.availableCopies < book.totalCopies) {
      throw new BadRequestException('Cannot delete active borrowed book');
    }

    await this.bookModel.findByIdAndDelete(id);

    return { message: 'Book deleted successfully' };
  }

  // ================================
  // STATS
  // ================================
  async getStats() {
    const [total, available, borrowed] = await Promise.all([
      this.bookModel.countDocuments(),
      this.bookModel.countDocuments({ availableCopies: { $gt: 0 } }),
      this.bookModel.aggregate([
        {
          $group: {
            _id: null,
            totalBorrowed: {
              $sum: {
                $subtract: ['$totalCopies', '$availableCopies'],
              },
            },
          },
        },
      ]),
    ]);

    return {
      data: {
        totalBooks: total,
        availableBooks: available,
        borrowedCopies: borrowed?.[0]?.totalBorrowed || 0,
      },
    };
  }
}