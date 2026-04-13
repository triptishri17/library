"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowRecordSchema = exports.BorrowRecord = exports.BorrowStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var BorrowStatus;
(function (BorrowStatus) {
    BorrowStatus["ISSUED"] = "issued";
    BorrowStatus["RETURNED"] = "returned";
    BorrowStatus["OVERDUE"] = "overdue";
    BorrowStatus["RENEWED"] = "renewed";
})(BorrowStatus || (exports.BorrowStatus = BorrowStatus = {}));
let BorrowRecord = class BorrowRecord {
};
exports.BorrowRecord = BorrowRecord;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Book', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], BorrowRecord.prototype, "bookId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], BorrowRecord.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], BorrowRecord.prototype, "issuedDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], BorrowRecord.prototype, "dueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], BorrowRecord.prototype, "returnDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: BorrowStatus, default: BorrowStatus.ISSUED }),
    __metadata("design:type", String)
], BorrowRecord.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], BorrowRecord.prototype, "renewCount", void 0);
exports.BorrowRecord = BorrowRecord = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BorrowRecord);
exports.BorrowRecordSchema = mongoose_1.SchemaFactory.createForClass(BorrowRecord);
exports.BorrowRecordSchema.index({ userId: 1, status: 1 });
exports.BorrowRecordSchema.index({ dueDate: 1, status: 1 });
//# sourceMappingURL=borrow-record.schema.js.map