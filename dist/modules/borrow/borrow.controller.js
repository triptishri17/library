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
exports.BorrowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const borrow_service_1 = require("./borrow.service");
const borrow_dto_1 = require("./dto/borrow.dto");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const roles_guard_1 = require("../../guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const user_schema_1 = require("../../schemas/user.schema");
let BorrowController = class BorrowController {
    constructor(borrowService) {
        this.borrowService = borrowService;
    }
    issue(dto) {
        return this.borrowService.issueBook(dto);
    }
    returnBook(dto) {
        return this.borrowService.returnBook(dto);
    }
    renew(dto) {
        return this.borrowService.renewBook(dto);
    }
    getHistory(query, user) {
        if (user.role === user_schema_1.UserRole.STUDENT)
            query.userId = user._id.toString();
        return this.borrowService.getHistory(query);
    }
    getOverdue() {
        return this.borrowService.getOverdueBooks();
    }
    getStats() {
        return this.borrowService.getDashboardStats();
    }
};
exports.BorrowController = BorrowController;
__decorate([
    (0, common_1.Post)('issue'),
    (0, decorators_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    (0, swagger_1.ApiOperation)({ summary: 'Issue a book to a user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [borrow_dto_1.IssueBookDto]),
    __metadata("design:returntype", void 0)
], BorrowController.prototype, "issue", null);
__decorate([
    (0, common_1.Post)('return'),
    (0, decorators_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    (0, swagger_1.ApiOperation)({ summary: 'Return a borrowed book' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [borrow_dto_1.ReturnBookDto]),
    __metadata("design:returntype", void 0)
], BorrowController.prototype, "returnBook", null);
__decorate([
    (0, common_1.Post)('renew'),
    (0, decorators_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    (0, swagger_1.ApiOperation)({ summary: 'Renew a borrowed book' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [borrow_dto_1.RenewBookDto]),
    __metadata("design:returntype", void 0)
], BorrowController.prototype, "renew", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get borrow history' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [borrow_dto_1.QueryBorrowDto, Object]),
    __metadata("design:returntype", void 0)
], BorrowController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('overdue'),
    (0, decorators_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BorrowController.prototype, "getOverdue", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, decorators_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.LIBRARIAN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BorrowController.prototype, "getStats", null);
exports.BorrowController = BorrowController = __decorate([
    (0, swagger_1.ApiTags)('Borrow'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('borrow'),
    __metadata("design:paramtypes", [borrow_service_1.BorrowService])
], BorrowController);
//# sourceMappingURL=borrow.controller.js.map