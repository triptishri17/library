import { Model } from 'mongoose';
import { BorrowRecord, BorrowRecordDocument } from '../../schemas/borrow-record.schema';
import { BookDocument } from '../../schemas/book.schema';
import { FineDocument } from '../../schemas/fine.schema';
import { NotificationDocument } from '../../schemas/notification.schema';
import { IssueBookDto, ReturnBookDto, RenewBookDto, QueryBorrowDto } from './dto/borrow.dto';
export declare class BorrowService {
    private borrowModel;
    private bookModel;
    private fineModel;
    private notificationModel;
    constructor(borrowModel: Model<BorrowRecordDocument>, bookModel: Model<BookDocument>, fineModel: Model<FineDocument>, notificationModel: Model<NotificationDocument>);
    issueBook(dto: IssueBookDto): Promise<{
        data: Omit<import("mongoose").Document<unknown, {}, BorrowRecordDocument> & BorrowRecord & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>;
        message: string;
    }>;
    returnBook(dto: ReturnBookDto): Promise<{
        data: {
            record: import("mongoose").Document<unknown, {}, BorrowRecordDocument> & BorrowRecord & import("mongoose").Document<any, any, any> & {
                _id: import("mongoose").Types.ObjectId;
            };
            fine: any;
        };
        message: string;
    }>;
    renewBook(dto: RenewBookDto): Promise<{
        data: import("mongoose").Document<unknown, {}, BorrowRecordDocument> & BorrowRecord & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    getHistory(query: QueryBorrowDto): Promise<{
        data: Omit<Omit<import("mongoose").Document<unknown, {}, BorrowRecordDocument> & BorrowRecord & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>, never>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getOverdueBooks(): Promise<{
        data: Omit<Omit<import("mongoose").Document<unknown, {}, BorrowRecordDocument> & BorrowRecord & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>, never>[];
    }>;
    getDashboardStats(): Promise<{
        data: {
            activeBorrows: number;
            returnedBooks: number;
            overdueBooks: number;
        };
    }>;
    markOverdueAndSendReminders(): Promise<void>;
}
