import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // =========================================================
  // ✅ GET ALL USERS (SEARCH + FILTER + PAGINATION)
  // =========================================================
  async findAll(query: QueryUserDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // 🔍 SEARCH
    if (query.search?.trim()) {
      filter.$or = [
        { name: { $regex: query.search.trim(), $options: 'i' } },
        { email: { $regex: query.search.trim(), $options: 'i' } },
        { membershipId: { $regex: query.search.trim(), $options: 'i' } },
      ];
    }

    // 🎯 ROLE FILTER
    if (query.role?.trim()) {
      filter.role = query.role;
    }

    try {
      const [users, total] = await Promise.all([
        this.userModel
          .find(filter)
          .select('-password')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),

        this.userModel.countDocuments(filter),
      ]);

      return {
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('❌ USERS FIND ALL ERROR:', error);
      throw new BadRequestException('Error fetching users');
    }
  }

  // =========================================================
  // ✅ GET SINGLE USER
  // =========================================================
  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel
      .findById(id)
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { data: user };
  }

  // =========================================================
  // ✅ CREATE USER
  // =========================================================
  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase();

    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.userModel.create({
      ...dto,
      email,
    });

    const { password, ...result } = user.toObject();

    return {
      data: result,
      message: 'User created successfully',
    };
  }

  // =========================================================
  // ✅ UPDATE USER
  // =========================================================
  async update(id: string, dto: UpdateUserDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    // 🔁 EMAIL UNIQUENESS CHECK
    if (dto.email) {
      const email = dto.email.toLowerCase();

      const existing = await this.userModel.findOne({
        email,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ConflictException('Email already in use');
      }

      dto.email = email;
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, dto, {
        new: true,
        runValidators: true,
      })
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      data: user,
      message: 'User updated successfully',
    };
  }

  // =========================================================
  // ✅ DELETE USER
  // =========================================================
  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User deleted successfully',
    };
  }

  // =========================================================
  // ✅ DASHBOARD STATS
  // =========================================================
  async getDashboardStats() {
    try {
      const [total, admins, librarians, students] =
        await Promise.all([
          this.userModel.countDocuments(),
          this.userModel.countDocuments({ role: 'admin' }),
          this.userModel.countDocuments({ role: 'librarian' }),
          this.userModel.countDocuments({ role: 'student' }),
        ]);

      return {
        data: {
          totalUsers: total,
          admins,
          librarians,
          students,
        },
      };
    } catch (error) {
      console.error('❌ USER STATS ERROR:', error);
      throw new BadRequestException('Error fetching stats');
    }
  }
}