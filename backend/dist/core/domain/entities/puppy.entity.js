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
exports.Puppy = void 0;
const core_1 = require("@mikro-orm/core");
const waiting_list_entity_1 = require("./waiting-list.entity");
const uuid_1 = require("uuid");
let Puppy = class Puppy {
    constructor() {
        this.id = (0, uuid_1.v4)();
        this.isServiced = false;
        this.orderIndex = 0;
        this.createdAt = new Date();
        this.status = 'Pending';
    }
};
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", String)
], Puppy.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' }),
    __metadata("design:type", String)
], Puppy.prototype, "petName", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' }),
    __metadata("design:type", String)
], Puppy.prototype, "customerName", void 0);
__decorate([
    (0, core_1.Property)({ type: 'string' }),
    __metadata("design:type", String)
], Puppy.prototype, "service", void 0);
__decorate([
    (0, core_1.Property)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Puppy.prototype, "appointmentTime", void 0);
__decorate([
    (0, core_1.Property)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Puppy.prototype, "isServiced", void 0);
__decorate([
    (0, core_1.Property)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Puppy.prototype, "orderIndex", void 0);
__decorate([
    (0, core_1.Property)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Puppy.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => waiting_list_entity_1.WaitingList, { nullable: false }),
    __metadata("design:type", waiting_list_entity_1.WaitingList)
], Puppy.prototype, "waitingList", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Puppy.prototype, "status", void 0);
Puppy = __decorate([
    (0, core_1.Entity)({ tableName: 'puppies' })
], Puppy);
exports.Puppy = Puppy;
//# sourceMappingURL=puppy.entity.js.map