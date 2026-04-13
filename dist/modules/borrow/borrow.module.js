"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const borrow_controller_1 = require("./borrow.controller");
const borrow_service_1 = require("./borrow.service");
const borrow_record_schema_1 = require("../../schemas/borrow-record.schema");
const book_schema_1 = require("../../schemas/book.schema");
const fine_schema_1 = require("../../schemas/fine.schema");
const notification_schema_1 = require("../../schemas/notification.schema");
let BorrowModule = class BorrowModule {
};
exports.BorrowModule = BorrowModule;
exports.BorrowModule = BorrowModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: borrow_record_schema_1.BorrowRecord.name, schema: borrow_record_schema_1.BorrowRecordSchema },
                { name: book_schema_1.Book.name, schema: book_schema_1.BookSchema },
                { name: fine_schema_1.Fine.name, schema: fine_schema_1.FineSchema },
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
            ]),
        ],
        controllers: [borrow_controller_1.BorrowController],
        providers: [borrow_service_1.BorrowService],
        exports: [borrow_service_1.BorrowService],
    })
], BorrowModule);
//# sourceMappingURL=borrow.module.js.map