import { Model } from 'mongoose';
import { Book, BookDocument } from '../../schemas/book.schema';
import { CreateBookDto, UpdateBookDto, QueryBookDto } from './dto/book.dto';
export declare class BooksService {
    private bookModel;
    constructor(bookModel: Model<BookDocument>);
    findAll(query: QueryBookDto): Promise<{
        data: Omit<import("mongoose").Document<unknown, {}, BookDocument> & Book & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, BookDocument> & Book & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    create(dto: CreateBookDto, coverImage?: string): Promise<{
        data: import("mongoose").Document<unknown, {}, BookDocument> & Book & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    update(id: string, dto: UpdateBookDto, coverImage?: string): Promise<{
        data: import("mongoose").Document<unknown, {}, BookDocument> & Book & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getStats(): Promise<{
        data: {
            totalBooks: number;
            availableBooks: number;
            borrowedCopies: any;
        };
    }>;
}
