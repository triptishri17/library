"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { email: { $regex: query.search, $options: 'i' } },
                { membershipId: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.role)
            filter.role = query.role;
        const [users, total] = await Promise.all([
            this.userModel.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.userModel.countDocuments(filter),
        ]);
        return {
            data: users,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const user = await this.userModel.findById(id).select('-password');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return { data: user };
    }
    async create(dto) {
        const existing = await this.userModel.findOne({ email: dto.email });
        if (existing)
            throw new common_1.ConflictException('Email already exists');
        const user = await this.userModel.create(dto);
        const { password, ...result } = user.toObject();
        return { data: result, message: 'User created successfully' };
    }
    async update(id, dto) {
        if (dto.email) {
            const existing = await this.userModel.findOne({ email: dto.email, _id: { $ne: id } });
            if (existing)
                throw new common_1.ConflictException('Email already in use');
        }
        const user = await this.userModel
            .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
            .select('-password');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return { data: user, message: 'User updated successfully' };
    }
    async remove(id) {
        const user = await this.userModel.findByIdAndDelete(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map