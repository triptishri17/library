import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../../schemas/category.schema").CategoryDocument> & import("../../schemas/category.schema").Category & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    findOne(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/category.schema").CategoryDocument> & import("../../schemas/category.schema").Category & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    create(dto: CreateCategoryDto): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/category.schema").CategoryDocument> & import("../../schemas/category.schema").Category & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/category.schema").CategoryDocument> & import("../../schemas/category.schema").Category & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
