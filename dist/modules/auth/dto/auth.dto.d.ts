import { UserRole } from '../../../schemas/user.schema';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    membershipId?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
