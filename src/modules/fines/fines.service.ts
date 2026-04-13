import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Fine, FineDocument, FineStatus } from '../../schemas/fine.schema';

@Injectable()
export class FinesService {
  constructor(@InjectModel(Fine.name) private fineModel: Model<FineDocument>) {}

  async findAll(query: { page?: number; limit?: number; userId?: string; status?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (query.userId) filter.userId = query.userId;
    if (query.status) filter.status = query.status;

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

  async findOne(id: string) {
    const fine = await this.fineModel
      .findById(id)
      .populate('userId', 'name email')
      .populate({ path: 'borrowRecordId', populate: { path: 'bookId', select: 'title author' } });
    if (!fine) throw new NotFoundException('Fine not found');
    return { data: fine };
  }

  async payFine(id: string) {
    const fine = await this.fineModel.findById(id);
    if (!fine) throw new NotFoundException('Fine not found');
    if (fine.status === FineStatus.PAID) throw new BadRequestException('Fine already paid');
    if (fine.status === FineStatus.WAIVED) throw new BadRequestException('Fine has been waived');

    const updated = await this.fineModel.findByIdAndUpdate(
      id,
      { status: FineStatus.PAID, paidAt: new Date() },
      { new: true },
    );
    return { data: updated, message: 'Fine paid successfully' };
  }

  async waiveFine(id: string) {
    const fine = await this.fineModel.findById(id);
    if (!fine) throw new NotFoundException('Fine not found');
    if (fine.status !== FineStatus.PENDING) throw new BadRequestException('Only pending fines can be waived');

    const updated = await this.fineModel.findByIdAndUpdate(id, { status: FineStatus.WAIVED }, { new: true });
    return { data: updated, message: 'Fine waived successfully' };
  }

  async getUserPendingFines(userId: string) {
    const fines = await this.fineModel
      .find({ userId, status: FineStatus.PENDING })
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
}
