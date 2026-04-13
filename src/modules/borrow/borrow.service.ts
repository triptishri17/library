import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { BorrowRecord, BorrowRecordDocument, BorrowStatus } from '../../schemas/borrow-record.schema';
import { Book, BookDocument } from '../../schemas/book.schema';
import { Fine, FineDocument } from '../../schemas/fine.schema';
import { Notification, NotificationDocument } from '../../schemas/notification.schema';
import { NotificationType } from '../../schemas/notification.schema';
import { IssueBookDto, ReturnBookDto, RenewBookDto, QueryBorrowDto } from './dto/borrow.dto';

const FINE_PER_DAY = Number(process.env.FINE_AMOUNT_PER_DAY) || 5;
const MAX_RENEWALS = 2;
const DEFAULT_BORROW_DAYS = 14;

@Injectable()
export class BorrowService {
  constructor(
    @InjectModel(BorrowRecord.name) private borrowModel: Model<BorrowRecordDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Fine.name) private fineModel: Model<FineDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async issueBook(dto: IssueBookDto) {
    const book = await this.bookModel.findById(dto.bookId);
    if (!book) throw new NotFoundException('Book not found');
    if (book.availableCopies < 1) throw new BadRequestException('No copies available');

    const existingBorrow = await this.borrowModel.findOne({
      bookId: dto.bookId,
      userId: dto.userId,
      status: { $in: [BorrowStatus.ISSUED, BorrowStatus.RENEWED] },
    });
    if (existingBorrow) throw new BadRequestException('User already has this book borrowed');

    const pendingFine = await this.fineModel.findOne({ userId: dto.userId, status: 'pending' });
    if (pendingFine) throw new BadRequestException('User has a pending fine. Please clear fines before borrowing');

    const issuedDate = new Date();
    const dueDate = dto.dueDate
      ? new Date(dto.dueDate)
      : new Date(Date.now() + DEFAULT_BORROW_DAYS * 24 * 60 * 60 * 1000);

    const record = await this.borrowModel.create({
      bookId: dto.bookId,
      userId: dto.userId,
      issuedDate,
      dueDate,
      status: BorrowStatus.ISSUED,
    });

    await this.bookModel.findByIdAndUpdate(dto.bookId, { $inc: { availableCopies: -1 } });

    await this.notificationModel.create({
      userId: dto.userId,
      type: NotificationType.GENERAL,
      message: `You have borrowed "${book.title}". Due date: ${dueDate.toDateString()}`,
    });

    return {
      data: await record.populate(['bookId', 'userId']),
      message: 'Book issued successfully',
    };
  }

  async returnBook(dto: ReturnBookDto) {
    const record = await this.borrowModel.findById(dto.borrowRecordId).populate('bookId');
    if (!record) throw new NotFoundException('Borrow record not found');
    if (record.status === BorrowStatus.RETURNED) throw new BadRequestException('Book already returned');

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
        type: NotificationType.FINE_GENERATED,
        message: `Fine of ₹${amount} generated for late return of "${(record.bookId as any).title}"`,
      });
    }

    await record.updateOne({ status: BorrowStatus.RETURNED, returnDate });
    await this.bookModel.findByIdAndUpdate(record.bookId, { $inc: { availableCopies: 1 } });

    return {
      data: { record, fine },
      message: isOverdue ? `Book returned with fine of ₹${fine.amount}` : 'Book returned successfully',
    };
  }

  async renewBook(dto: RenewBookDto) {
    const record = await this.borrowModel.findById(dto.borrowRecordId).populate('bookId');
    if (!record) throw new NotFoundException('Borrow record not found');
    if (record.status === BorrowStatus.RETURNED) throw new BadRequestException('Book already returned');
    if (record.renewCount >= MAX_RENEWALS) throw new BadRequestException(`Maximum ${MAX_RENEWALS} renewals reached`);

    const newDueDate = dto.newDueDate
      ? new Date(dto.newDueDate)
      : new Date(record.dueDate.getTime() + DEFAULT_BORROW_DAYS * 24 * 60 * 60 * 1000);

    await record.updateOne({
      dueDate: newDueDate,
      status: BorrowStatus.RENEWED,
      $inc: { renewCount: 1 },
    });

    return {
      data: await this.borrowModel.findById(dto.borrowRecordId).populate(['bookId', 'userId']),
      message: `Book renewed until ${newDueDate.toDateString()}`,
    };
  }

  async getHistory(query: QueryBorrowDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.userId) filter.userId = query.userId;
    if (query.status) filter.status = query.status;

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
      .find({ status: { $in: [BorrowStatus.ISSUED, BorrowStatus.RENEWED] }, dueDate: { $lt: new Date() } })
      .populate('bookId', 'title author')
      .populate('userId', 'name email');
    return { data: overdue };
  }

  async getDashboardStats() {
    const [active, returned, overdue] = await Promise.all([
      this.borrowModel.countDocuments({ status: { $in: [BorrowStatus.ISSUED, BorrowStatus.RENEWED] } }),
      this.borrowModel.countDocuments({ status: BorrowStatus.RETURNED }),
      this.borrowModel.countDocuments({ status: { $in: [BorrowStatus.ISSUED, BorrowStatus.RENEWED] }, dueDate: { $lt: new Date() } }),
    ]);
    return { data: { activeBorrows: active, returnedBooks: returned, overdueBooks: overdue } };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markOverdueAndSendReminders() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await this.borrowModel.updateMany(
      { status: { $in: [BorrowStatus.ISSUED, BorrowStatus.RENEWED] }, dueDate: { $lt: now } },
      { status: BorrowStatus.OVERDUE },
    );

    const dueTomorrow = await this.borrowModel
      .find({ status: { $in: [BorrowStatus.ISSUED, BorrowStatus.RENEWED] }, dueDate: { $gte: now, $lte: tomorrow } })
      .populate('bookId', 'title');

    for (const record of dueTomorrow) {
      await this.notificationModel.create({
        userId: record.userId,
        type: NotificationType.DUE_REMINDER,
        message: `Reminder: "${(record.bookId as any).title}" is due tomorrow!`,
      });
    }

    const overdueRecords = await this.borrowModel
      .find({ status: BorrowStatus.OVERDUE })
      .populate('bookId', 'title');

    for (const record of overdueRecords) {
      const overdueDays = Math.ceil((now.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      await this.notificationModel.create({
        userId: record.userId,
        type: NotificationType.OVERDUE_ALERT,
        message: `"${(record.bookId as any).title}" is ${overdueDays} day(s) overdue. Fine: ₹${overdueDays * FINE_PER_DAY}`,
      });
    }
  }
}
