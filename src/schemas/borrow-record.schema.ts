import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BorrowRecordDocument = BorrowRecord & Document;

export enum BorrowStatus {
  ISSUED = 'issued',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  RENEWED = 'renewed',
}

@Schema({ timestamps: true })
export class BorrowRecord {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  issuedDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop()
  returnDate: Date;

  @Prop({ enum: BorrowStatus, default: BorrowStatus.ISSUED })
  status: BorrowStatus;

  @Prop({ default: 0 })
  renewCount: number;
}

export const BorrowRecordSchema = SchemaFactory.createForClass(BorrowRecord);

BorrowRecordSchema.index({ userId: 1, status: 1 });
BorrowRecordSchema.index({ dueDate: 1, status: 1 });
