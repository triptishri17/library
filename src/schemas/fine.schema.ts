import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FineDocument = Fine & Document;

export enum FineStatus {
  PENDING = 'pending',
  PAID = 'paid',
  WAIVED = 'waived',
}

@Schema({ timestamps: true })
export class Fine {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BorrowRecord', required: true })
  borrowRecordId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ enum: FineStatus, default: FineStatus.PENDING })
  status: FineStatus;

  @Prop()
  paidAt: Date;
}

export const FineSchema = SchemaFactory.createForClass(Fine);
FineSchema.index({ userId: 1, status: 1 });
