import { Document, Types } from 'mongoose';
export type BorrowRecordDocument = BorrowRecord & Document;
export declare enum BorrowStatus {
    ISSUED = "issued",
    RETURNED = "returned",
    OVERDUE = "overdue",
    RENEWED = "renewed"
}
export declare class BorrowRecord {
    bookId: Types.ObjectId;
    userId: Types.ObjectId;
    issuedDate: Date;
    dueDate: Date;
    returnDate: Date;
    status: BorrowStatus;
    renewCount: number;
}
export declare const BorrowRecordSchema: import("mongoose").Schema<BorrowRecord, import("mongoose").Model<BorrowRecord, any, any, any, Document<unknown, any, BorrowRecord> & BorrowRecord & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BorrowRecord, Document<unknown, {}, import("mongoose").FlatRecord<BorrowRecord>> & import("mongoose").FlatRecord<BorrowRecord> & {
    _id: Types.ObjectId;
}>;
