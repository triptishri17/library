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
exports.BorrowService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const mongoose_2 = require("mongoose");
const borrow_record_schema_1 = require("../../schemas/borrow-record.schema");
const book_schema_1 = require("../../schemas/book.schema");
const fine_schema_1 = require("../../schemas/fine.schema");
const notification_schema_1 = require("../../schemas/notification.schema");
const notification_schema_2 = require("../../schemas/notification.schema");
const FINE_PER_DAY = Number(process.env.FINE_AMOUNT_PER_DAY) || 5;
const MAX_RENEWALS = 2;
const DEFAULT_BORROW_DAYS = 14;
let BorrowService = class BorrowService {
    constructor(borrowModel, bookModel, fineModel, notificationModel) {
        this.borrowModel = borrowModel;
        this.bookModel = bookModel;
        this.fineModel = fineModel;
        this.notificationModel = notificationModel;
    }
    async issueBook(dto) {
        const book = await this.bookModel.findById(dto.bookId);
        if (!book)
            throw new common_1.NotFoundException('Book not found');
        if (book.availableCopies < 1)
            throw new common_1.BadRequestException('No copies available');
        const existingBorrow = await this.borrowModel.findOne({
            bookId: dto.bookId,
            userId: dto.userId,
            status: { $in: [borrow_record_schema_1.BorrowStatus.ISSUED, borrow_record_schema_1.BorrowStatus.RENEWED] },
        });
        if (existingBorrow)
            throw new common_1.BadRequestException('User already has this book borrowed');
        const pendingFine = await this.fineModel.findOne({ userId: dto.userId, status: 'pending' });
        if (pendingFine)
            throw new common_1.BadRequestException('User has a pending fine. Please clear fines before borrowing');
        const issuedDate = new Date();
        const dueDate = dto.dueDate
            ? new Date(dto.dueDate)
            : new Date(Date.now() + DEFAULT_BORROW_DAYS * 24 * 60 * 60 * 1000);
        const record = await this.borrowModel.create({
            bookId: dto.bookId,
            userId: dto.userId,
            issuedDate,
            dueDate,
            status: borrow_record_schema_1.BorrowStatus.ISSUED,
        });
        await this.bookModel.findByIdAndUpdate(dto.bookId, { $inc: { availableCopies: -1 } });
        await this.notificationModel.create({
            userId: dto.userId,
            type: notification_schema_2.NotificationType.GENERAL,
            message: `You have borrowed "${book.title}". Due date: ${dueDate.toDateString()}`,
        });
        return {
            data: await record.populate(['bookId', 'userId']),
            message: 'Book issued successfully',
        };
    }
    async returnBook(dto) {
        const record = await this.borrowModel.findById(dto.borrowRecordId).populate('bookId');
        if (!record)
            throw new common_1.NotFoundException('Borrow record not found');
        if (record.status === borrow_record_schema_1.BorrowStatus.RETURNED)
            throw new common_1.BadRequestException('Book already returned');
        const returnDate = new Date();
        const isOverdue = returnDate > record.dueDate;
        let fine = null;
        if (isOverdue) {
            const overdueDays = Math.ceil((returnDate.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24));
            const amount = overdueDays * FINE_PER_DAY;
            fine = await this.fineModel.create({
                userId: record.userId,
                borrowRecordId: record._id,
                amount,
                reason: `Overdue by ${overdueDays} day(s). ₹${FINE_PER_DAY}/day`,
                status: 'pending',
            });
            await this.notificationModel.create({
                userId: record.userId,
                type: notification_schema_2.NotificationType.FINE_GENERATED,
                message: `Fine of ₹${amount} generated for late return of "${record.bookId.title}"`,
            });
        }
        await record.updateOne({ status: borrow_record_schema_1.BorrowStatus.RETURNED, returnDate });
        await this.bookModel.findByIdAndUpdate(record.bookId, { $inc: { availableCopies: 1 } });
        return {
            data: { record, fine },
            message: isOverdue ? `Book returned with fine of ₹${fine.amount}` : 'Book returned successfully',
        };
    }
    async renewBook(dto) {
        const record = await this.borrowModel.findById(dto.borrowRecordId).populate('bookId');
        if (!record)
            throw new common_1.NotFoundException('Borrow record not found');
        if (record.status === borrow_record_schema_1.BorrowStatus.RETURNED)
            throw new common_1.BadRequestException('Book already returned');
        if (record.renewCount >= MAX_RENEWALS)
            throw new common_1.BadRequestException(`Maximum ${MAX_RENEWALS} renewals reached`);
        const newDueDate = dto.newDueDate
            ? new Date(dto.newDueDate)
            : new Date(record.dueDate.getTime() + DEFAULT_BORROW_DAYS * 24 * 60 * 60 * 1000);
        await record.updateOne({
            dueDate: newDueDate,
            status: borrow_record_schema_1.BorrowStatus.RENEWED,
            $inc: { renewCount: 1 },
        });
        return {
            data: await this.borrowModel.findById(dto.borrowRecordId).populate(['bookId', 'userId']),
            message: `Book renewed until ${newDueDate.toDateString()}`,
        };
    }
    async getHistory(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.userId)
            filter.userId = query.userId;
        if (query.status)
            filter.status = query.status;
        const [records, total] = await Promise.all([
            this.borrowModel
                .find(filter)
                .populate('bookId', 'title author isbn coverImage')
                .populate('userId', 'name email membershipId')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            this.borrowModel.countDocuments(filter),
        ]);
        return {
            data: records,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getOverdueBooks() {
        const overdue = await this.borrowModel
            .find({ status: { $in: [borrow_record_schema_1.BorrowStatus.ISSUED, borrow_record_schema_1.BorrowStatus.RENEWED] }, dueDate: { $lt: new Date() } })
            .populate('bookId', 'title author')
            .populate('userId', 'name email');
        return { data: overdue };
    }
    async getDashboardStats() {
        const [active, returned, overdue] = await Promise.all([
            this.borrowModel.countDocuments({ status: { $in: [borrow_record_schema_1.BorrowStatus.ISSUED, borrow_record_schema_1.BorrowStatus.RENEWED] } }),
            this.borrowModel.countDocuments({ status: borrow_record_schema_1.BorrowStatus.RETURNED }),
            this.borrowModel.countDocuments({ status: { $in: [borrow_record_schema_1.BorrowStatus.ISSUED, borrow_record_schema_1.BorrowStatus.RENEWED] }, dueDate: { $lt: new Date() } }),
        ]);
        return { data: { activeBorrows: active, returnedBooks: returned, overdueBooks: overdue } };
    }
    async markOverdueAndSendReminders() {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        await this.borrowModel.updateMany({ status: { $in: [borrow_record_schema_1.BorrowStatus.ISSUED, borrow_record_schema_1.BorrowStatus.RENEWED] }, dueDate: { $lt: now } }, { status: borrow_record_schema_1.BorrowStatus.OVERDUE });
        const dueTomorrow = await this.borrowModel
            .find({ status: { $in: [borrow_record_schema_1.BorrowStatus.ISSUED, borrow_record_schema_1.BorrowStatus.RENEWED] }, dueDate: { $gte: now, $lte: tomorrow } })
            .populate('bookId', 'title');
        for (const record of dueTomorrow) {
            await this.notificationModel.create({
                userId: record.userId,
                type: notification_schema_2.NotificationType.DUE_REMINDER,
                message: `Reminder: "${record.bookId.title}" is due tomorrow!`,
            });
        }
        const overdueRecords = await this.borrowModel
            .find({ status: borrow_record_schema_1.BorrowStatus.OVERDUE })
            .populate('bookId', 'title');
        for (const record of overdueRecords) {
            const overdueDays = Math.ceil((now.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24));
            await this.notificationModel.create({
                userId: record.userId,
                type: notification_schema_2.NotificationType.OVERDUE_ALERT,
                message: `"${record.bookId.title}" is ${overdueDays} day(s) overdue. Fine: ₹${overdueDays * FINE_PER_DAY}`,
            });
        }
    }
};
exports.BorrowService = BorrowService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BorrowService.prototype, "markOverdueAndSendReminders", null);
exports.BorrowService = BorrowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(borrow_record_schema_1.BorrowRecord.name)),
    __param(1, (0, mongoose_1.InjectModel)(book_schema_1.Book.name)),
    __param(2, (0, mongoose_1.InjectModel)(fine_schema_1.Fine.name)),
    __param(3, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], BorrowService);
//# sourceMappingURL=borrow.service.js.map