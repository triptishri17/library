import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto, QueryBookDto } from './dto/book.dto';
export declare class BooksController {
    private readonly booksService;
    constructor(booksService: BooksService);
    findAll(query: QueryBookDto): Promise<{
        data: Omit<import("mongoose").Document<unknown, {}, import("../../schemas/book.schema").BookDocument> & import("../../schemas/book.schema").Book & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<{
        data: {
            totalBooks: number;
            availableBooks: number;
            borrowedCopies: any;
        };
    }>;
    findOne(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/book.schema").BookDocument> & import("../../schemas/book.schema").Book & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    create(dto: CreateBookDto, file?: Express.Multer.File): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/book.schema").BookDocument> & import("../../schemas/book.schema").Book & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    update(id: string, dto: UpdateBookDto, file?: Express.Multer.File): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/book.schema").BookDocument> & import("../../schemas/book.schema").Book & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
