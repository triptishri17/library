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
exports.FinesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const fine_schema_1 = require("../../schemas/fine.schema");
let FinesService = class FinesService {
    constructor(fineModel) {
        this.fineModel = fineModel;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.userId)
            filter.userId = query.userId;
        if (query.status)
            filter.status = query.status;
        const [fines, total] = await Promise.all([
            this.fineModel
                .find(filter)
                .populate('userId', 'name email membershipId')
                .populate({ path: 'borrowRecordId', populate: { path: 'bookId', select: 'title author' } })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            this.fineModel.countDocuments(filter),
        ]);
        return { data: fines, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async findOne(id) {
        const fine = await this.fineModel
            .findById(id)
            .populate('userId', 'name email')
            .populate({ path: 'borrowRecordId', populate: { path: 'bookId', select: 'title author' } });
        if (!fine)
            throw new common_1.NotFoundException('Fine not found');
        return { data: fine };
    }
    async payFine(id) {
        const fine = await this.fineModel.findById(id);
        if (!fine)
            throw new common_1.NotFoundException('Fine not found');
        if (fine.status === fine_schema_1.FineStatus.PAID)
            throw new common_1.BadRequestException('Fine already paid');
        if (fine.status === fine_schema_1.FineStatus.WAIVED)
            throw new common_1.BadRequestException('Fine has been waived');
        const updated = await this.fineModel.findByIdAndUpdate(id, { status: fine_schema_1.FineStatus.PAID, paidAt: new Date() }, { new: true });
        return { data: updated, message: 'Fine paid successfully' };
    }
    async waiveFine(id) {
        const fine = await this.fineModel.findById(id);
        if (!fine)
            throw new common_1.NotFoundException('Fine not found');
        if (fine.status !== fine_schema_1.FineStatus.PENDING)
            throw new common_1.BadRequestException('Only pending fines can be waived');
        const updated = await this.fineModel.findByIdAndUpdate(id, { status: fine_schema_1.FineStatus.WAIVED }, { new: true });
        return { data: updated, message: 'Fine waived successfully' };
    }
    async getUserPendingFines(userId) {
        const fines = await this.fineModel
            .find({ userId, status: fine_schema_1.FineStatus.PENDING })
            .populate({ path: 'borrowRecordId', populate: { path: 'bookId', select: 'title' } });
        const total = fines.reduce((sum, f) => sum + f.amount, 0);
        return { data: { fines, totalPending: total } };
    }
    async getStats() {
        const [pending, paid, waived] = await Promise.all([
            this.fineModel.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
            this.fineModel.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
            this.fineModel.countDocuments({ status: 'waived' }),
        ]);
        return {
            data: {
                pendingAmount: pending[0]?.total || 0,
                collectedAmount: paid[0]?.total || 0,
                waivedCount: waived,
            },
        };
    }
};
exports.FinesService = FinesService;
exports.FinesService = FinesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(fine_schema_1.Fine.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FinesService);
//# sourceMappingURL=fines.service.js.map