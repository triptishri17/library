"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const book_schema_1 = require("../../schemas/book.schema");
let BooksService = class BooksService {
    constructor(bookModel) {
        this.bookModel = bookModel;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.$or = [
                { title: { $regex: query.search, $options: 'i' } },
                { author: { $regex: query.search, $options: 'i' } },
                { isbn: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.categoryId)
            filter.categoryId = query.categoryId;
        if (query.available === 'true')
            filter.availableCopies = { $gt: 0 };
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
    async findOne(id) {
        const book = await this.bookModel.findById(id).populate('categoryId', 'name slug');
        if (!book)
            throw new common_1.NotFoundException('Book not found');
        return { data: book };
    }
    async create(dto, coverImage) {
        const existing = await this.bookModel.findOne({ isbn: dto.isbn });
        if (existing)
            throw new common_1.ConflictException('Book with this ISBN already exists');
        const book = await this.bookModel.create({
            ...dto,
            availableCopies: dto.totalCopies,
            coverImage,
        });
        return { data: book, message: 'Book added successfully' };
    }
    async update(id, dto, coverImage) {
        if (dto.isbn) {
            const existing = await this.bookModel.findOne({ isbn: dto.isbn, _id: { $ne: id } });
            if (existing)
                throw new common_1.ConflictException('ISBN already in use');
        }
        const updateData = { ...dto };
        if (coverImage)
            updateData.coverImage = coverImage;
        if (dto.totalCopies !== undefined) {
            const book = await this.bookModel.findById(id);
            if (!book)
                throw new common_1.NotFoundException('Book not found');
            const borrowedCopies = book.totalCopies - book.availableCopies;
            if (dto.totalCopies < borrowedCopies) {
                throw new common_1.BadRequestException(`Cannot reduce below ${borrowedCopies} (currently borrowed)`);
            }
            updateData.availableCopies = dto.totalCopies - borrowedCopies;
        }
        const book = await this.bookModel
            .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('categoryId', 'name slug');
        if (!book)
            throw new common_1.NotFoundException('Book not found');
        return { data: book, message: 'Book updated successfully' };
    }
    async remove(id) {
        const book = await this.bookModel.findById(id);
        if (!book)
            throw new common_1.NotFoundException('Book not found');
        if (book.availableCopies < book.totalCopies) {
            throw new common_1.BadRequestException('Cannot delete book with active borrows');
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
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(book_schema_1.Book.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BooksService);
//# sourceMappingURL=books.service.js.map