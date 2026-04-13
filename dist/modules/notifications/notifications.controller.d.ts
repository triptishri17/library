import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(userId: string, query: any): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../../schemas/notification.schema").NotificationDocument> & import("../../schemas/notification.schema").Notification & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        meta: {
            total: number;
            unread: number;
            page: number;
            limit: number;
        };
    }>;
    markAllRead(userId: string): Promise<{
        message: string;
    }>;
    markAsRead(id: string, userId: string): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/notification.schema").NotificationDocument> & import("../../schemas/notification.schema").Notification & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        message: string;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
}
