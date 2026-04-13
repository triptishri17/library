import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinesController } from './fines.controller';
import { FinesService } from './fines.service';
import { Fine, FineSchema } from '../../schemas/fine.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Fine.name, schema: FineSchema }])],
  controllers: [FinesController],
  providers: [FinesService],
  exports: [FinesService],
})
export class FinesModule {}
