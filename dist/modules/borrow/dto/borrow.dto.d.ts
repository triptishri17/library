export declare class IssueBookDto {
    bookId: string;
    userId: string;
    dueDate?: string;
}
export declare class ReturnBookDto {
    borrowRecordId: string;
}
export declare class RenewBookDto {
    borrowRecordId: string;
    newDueDate?: string;
}
export declare class QueryBorrowDto {
    page?: number;
    limit?: number;
    userId?: string;
    status?: string;
}
