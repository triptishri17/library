import { BorrowService } from './borrow.service';
import { IssueBookDto, ReturnBookDto, RenewBookDto, QueryBorrowDto } from './dto/borrow.dto';
export declare class BorrowController {
    private readonly borrowService;
    constructor(borrowService: BorrowService);
    issue(dto: IssueBookDto): Promise<{
        data: Omit<import("mongoose").Document<unknown, {}, import("../../schemas/borrow-record.schema").BorrowRecordDocument> & import("../../schemas/borrow-record.schema").BorrowRecord & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>;
        message: string;
    }>;
    returnBook(dto: ReturnBookDto): Promise<{
        data: {
            record: import("mongoose").Document<unknown, {}, import("../../schemas/borrow-record.schema").BorrowRecordDocument> & import("../../schemas/borrow-record.schema").BorrowRecord & import("mongoose").Document<any, any, any> & {
                _id: import("mongoose").Types.ObjectId;
            };
            fine: any;
        };
        message: string;
    }>;
    renew(dto: RenewBookDto): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/borrow-record.schema").BorrowRecordDocument> & import("../../schemas/borrow-record.schema").BorrowRecord & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    getHistory(query: QueryBorrowDto, user: any): Promise<{
        data: Omit<Omit<import("mongoose").Document<unknown, {}, import("../../schemas/borrow-record.schema").BorrowRecordDocument> & import("../../schemas/borrow-record.schema").BorrowRecord & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>, never>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getOverdue(): Promise<{
        data: Omit<Omit<import("mongoose").Document<unknown, {}, import("../../schemas/borrow-record.schema").BorrowRecordDocument> & import("../../schemas/borrow-record.schema").BorrowRecord & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>, never>[];
    }>;
    getStats(): Promise<{
        data: {
            activeBorrows: number;
            returnedBooks: number;
            overdueBooks: number;
        };
    }>;
}
