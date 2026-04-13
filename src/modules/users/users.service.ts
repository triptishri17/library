import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(query: QueryUserDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { membershipId: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.role) filter.role = query.role;

    const [users, total] = await Promise.all([
      this.userModel.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return { data: user };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already exists');
    const user = await this.userModel.create(dto);
    const { password, ...result } = user.toObject();
    return { data: result, message: 'User created successfully' };
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existing = await this.userModel.findOne({ email: dto.email, _id: { $ne: id } });
      if (existing) throw new ConflictException('Email already in use');
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .select('-password');
    if (!user) throw new NotFoundException('User not found');
    return { data: user, message: 'User updated successfully' };
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  async getDashboardStats() {
    const [total, admins, librarians, students] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: 'admin' }),
      this.userModel.countDocuments({ role: 'librarian' }),
      this.userModel.countDocuments({ role: 'student' }),
    ]);
    return { data: { total, admins, librarians, students } };
  }
}
