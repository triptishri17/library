import { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare enum NotificationType {
    DUE_REMINDER = "due_reminder",
    OVERDUE_ALERT = "overdue_alert",
    BOOK_AVAILABLE = "book_available",
    FINE_GENERATED = "fine_generated",
    GENERAL = "general"
}
export declare class Notification {
    userId: Types.ObjectId;
    type: NotificationType;
    message: string;
    isRead: boolean;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification> & Notification & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
}>;
