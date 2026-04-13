import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../../schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private notifModel: Model<NotificationDocument>) {}

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unread] = await Promise.all([
      this.notifModel.find({ userId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.notifModel.countDocuments({ userId }),
      this.notifModel.countDocuments({ userId, isRead: false }),
    ]);
    return { data: notifications, meta: { total, unread, page, limit } };
  }

  async markAsRead(id: string, userId: string) {
    const notif = await this.notifModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true },
    );
    if (!notif) throw new NotFoundException('Notification not found');
    return { data: notif, message: 'Marked as read' };
  }

  async markAllRead(userId: string) {
    await this.notifModel.updateMany({ userId, isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(id: string, userId: string) {
    const notif = await this.notifModel.findOneAndDelete({ _id: id, userId });
    if (!notif) throw new NotFoundException('Notification not found');
    return { message: 'Notification deleted' };
  }
}
