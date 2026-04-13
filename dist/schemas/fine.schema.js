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
exports.FineSchema = exports.Fine = exports.FineStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var FineStatus;
(function (FineStatus) {
    FineStatus["PENDING"] = "pending";
    FineStatus["PAID"] = "paid";
    FineStatus["WAIVED"] = "waived";
})(FineStatus || (exports.FineStatus = FineStatus = {}));
let Fine = class Fine {
};
exports.Fine = Fine;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Fine.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'BorrowRecord', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Fine.prototype, "borrowRecordId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Fine.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Fine.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: FineStatus, default: FineStatus.PENDING }),
    __metadata("design:type", String)
], Fine.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Fine.prototype, "paidAt", void 0);
exports.Fine = Fine = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Fine);
exports.FineSchema = mongoose_1.SchemaFactory.createForClass(Fine);
exports.FineSchema.index({ userId: 1, status: 1 });
//# sourceMappingURL=fine.schema.js.map