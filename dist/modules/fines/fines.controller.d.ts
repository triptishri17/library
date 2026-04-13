import { FinesService } from './fines.service';
export declare class FinesController {
    private readonly finesService;
    constructor(finesService: FinesService);
    findAll(query: any): Promise<{
        data: Omit<Omit<import("mongoose").Document<unknown, {}, import("../../schemas/fine.schema").FineDocument> & import("../../schemas/fine.schema").Fine & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        }, never>, never>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<{
        data: {
            pendingAmount: any;
            collectedAmount: any;
            waivedCount: number;
        };
    }>;
    getMyFines(userId: string): Promise<{
        data: {
            fines: Omit<import("mongoose").Document<unknown, {}, import("../../schemas/fine.schema").FineDocument> & import("../../schemas/fine.schema").Fine & import("mongoose").Document<any, any, any> & {
                _id: import("mongoose").Types.ObjectId;
            }, never>[];
            totalPending: number;
        };
    }>;
    findOne(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/fine.schema").FineDocument> & import("../../schemas/fine.schema").Fine & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    pay(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/fine.schema").FineDocument> & import("../../schemas/fine.schema").Fine & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    waive(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/fine.schema").FineDocument> & import("../../schemas/fine.schema").Fine & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
}
