import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../../schemas/notification.schema';
export declare class NotificationsService {
    private notifModel;
    constructor(notifModel: Model<NotificationDocument>);
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").Document<unknown, {}, NotificationDocument> & Notification & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        meta: {
            total: number;
            unread: number;
            page: number;
            limit: number;
        };
    }>;
    markAsRead(id: string, userId: string): Promise<{
        data: import("mongoose").Document<unknown, {}, NotificationDocument> & Notification & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    markAllRead(userId: string): Promise<{
        message: string;
    }>;
    deleteNotification(id: string, userId: string): Promise<{
        message: string;
    }>;
}
