import { Document, Types } from 'mongoose';
export type FineDocument = Fine & Document;
export declare enum FineStatus {
    PENDING = "pending",
    PAID = "paid",
    WAIVED = "waived"
}
export declare class Fine {
    userId: Types.ObjectId;
    borrowRecordId: Types.ObjectId;
    amount: number;
    reason: string;
    status: FineStatus;
    paidAt: Date;
}
export declare const FineSchema: import("mongoose").Schema<Fine, import("mongoose").Model<Fine, any, any, any, Document<unknown, any, Fine> & Fine & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Fine, Document<unknown, {}, import("mongoose").FlatRecord<Fine>> & import("mongoose").FlatRecord<Fine> & {
    _id: Types.ObjectId;
}>;
