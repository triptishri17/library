export declare class CreateBookDto {
    title: string;
    author: string;
    isbn: string;
    categoryId: string;
    description?: string;
    totalCopies: number;
    publishedYear?: number;
}
declare const UpdateBookDto_base: import("@nestjs/common").Type<Partial<CreateBookDto>>;
export declare class UpdateBookDto extends UpdateBookDto_base {
}
export declare class QueryBookDto {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    available?: string;
}
export {};
