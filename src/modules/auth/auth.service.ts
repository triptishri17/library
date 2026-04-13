import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: registerDto.email });
    if (existing) throw new ConflictException('Email already registered');

    if (registerDto.membershipId) {
      const existingMembership = await this.userModel.findOne({ membershipId: registerDto.membershipId });
      if (existingMembership) throw new ConflictException('Membership ID already in use');
    }

    const user = await this.userModel.create(registerDto);
    const token = this.generateToken(user);
    return {
      data: { user: this.sanitizeUser(user), token },
      message: 'Registration successful',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email }).select('+password');
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');

    const token = this.generateToken(user);
    return {
      data: { user: this.sanitizeUser(user), token },
      message: 'Login successful',
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return { data: user };
  }

  private generateToken(user: UserDocument) {
    return this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });
  }

  private sanitizeUser(user: UserDocument) {
    const { password, ...sanitized } = user.toObject();
    return sanitized;
  }
}
