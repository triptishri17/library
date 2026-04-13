import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        data: {
            user: any;
            token: string;
        };
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        data: {
            user: any;
            token: string;
        };
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/user.schema").UserDocument> & import("../../schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
}
