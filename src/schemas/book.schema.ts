import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  author: string;

  @Prop({ required: true, unique: true, trim: true })
  isbn: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, min: 1 })
  totalCopies: number;

  @Prop({ required: true, min: 0 })
  availableCopies: number;

  @Prop()
  publishedYear: number;

  @Prop()
  coverImage: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);

BookSchema.index({ title: 'text', author: 'text', isbn: 'text' });
