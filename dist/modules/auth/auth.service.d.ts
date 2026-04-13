import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        data: {
            user: any;
            token: string;
        };
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        data: {
            user: any;
            token: string;
        };
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        data: import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    private generateToken;
    private sanitizeUser;
}
