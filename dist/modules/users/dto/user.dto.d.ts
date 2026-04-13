import { UserRole } from '../../../schemas/user.schema';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    membershipId?: string;
}
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
}
export declare class QueryUserDto {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
}
export {};
