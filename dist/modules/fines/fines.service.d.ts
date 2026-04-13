import { Model } from 'mongoose';
import { Fine, FineDocument } from '../../schemas/fine.schema';
export declare class FinesService {
    private fineModel;
    constructor(fineModel: Model<FineDocument>);
    findAll(query: {
        page?: number;
        limit?: number;
        userId?: string;
        status?: string;
    }): Promise<{
        data: Omit<Omit<import("mongoose").Document<unknown, {}, FineDocument> & Fine & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>, never>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, FineDocument> & Fine & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    payFine(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, FineDocument> & Fine & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    waiveFine(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, FineDocument> & Fine & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    getUserPendingFines(userId: string): Promise<{
        data: {
            fines: Omit<import("mongoose").Document<unknown, {}, FineDocument> & Fine & import("mongoose").Document<any, any, any> & {
                _id: import("mongoose").Types.ObjectId;
            }, never>[];
            totalPending: number;
        };
    }>;
    getStats(): Promise<{
        data: {
            pendingAmount: any;
            collectedAmount: any;
            waivedCount: number;
        };
    }>;
}
