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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fines_service_1 = require("./fines.service");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const roles_guard_1 = require("../../guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const user_schema_1 = require("../../schemas/user.schema");
let FinesController = class FinesController {
    constructor(finesService) {
        this.finesService = finesService;
    }
    findAll(query) {
        return this.finesService.findAll(query);
    }
    getStats() {
        return this.finesService.getStats();
    }
    getMyFines(userId) {
        return this.finesService.getUserPendingFines(userId.toString());
    }
    findOne(id) {
        return this.finesService.findOne(id);
    }
    pay(id) {
        return this.finesService.payFine(id);
    }
    waive(id) {
        return this.finesService.waiveFine(id);
    }
};
exports.FinesController = FinesController;
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all fines' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, decorators_1.Roles)(user_schema_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('my-fines'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user pending fines' }),
    __param(0, (0, decorators_1.CurrentUser)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinesController.prototype, "getMyFines", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    (0, swagger_1.ApiOperation)({ summary: 'Pay a fine' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinesController.prototype, "pay", null);
__decorate([
    (0, common_1.Patch)(':id/waive'),
    (0, decorators_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    (0, swagger_1.ApiOperation)({ summary: 'Waive a fine' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinesController.prototype, "waive", null);
exports.FinesController = FinesController = __decorate([
    (0, swagger_1.ApiTags)('Fines'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('fines'),
    __metadata("design:paramtypes", [fines_service_1.FinesService])
], FinesController);
//# sourceMappingURL=fines.controller.js.map