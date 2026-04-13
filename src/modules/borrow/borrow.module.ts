import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';
import { BorrowRecord, BorrowRecordSchema } from '../../schemas/borrow-record.schema';
import { Book, BookSchema } from '../../schemas/book.schema';
import { Fine, FineSchema } from '../../schemas/fine.schema';
import { Notification, NotificationSchema } from '../../schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BorrowRecord.name, schema: BorrowRecordSchema },
      { name: Book.name, schema: BookSchema },
      { name: Fine.name, schema: FineSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [BorrowController],
  providers: [BorrowService],
  exports: [BorrowService],
})
export class BorrowModule {}
