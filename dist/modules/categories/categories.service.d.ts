import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private categoryModel;
    constructor(categoryModel: Model<CategoryDocument>);
    private toSlug;
    findAll(): Promise<{
        data: (import("mongoose").Document<unknown, {}, CategoryDocument> & Category & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    findOne(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, CategoryDocument> & Category & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    create(dto: CreateCategoryDto): Promise<{
        data: import("mongoose").Document<unknown, {}, CategoryDocument> & Category & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        data: import("mongoose").Document<unknown, {}, CategoryDocument> & Category & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
