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
exports.WaitingList = void 0;
const core_1 = require("@mikro-orm/core");
const puppy_entity_1 = require("./puppy.entity");
const uuid_1 = require("uuid");
let WaitingList = class WaitingList {
    constructor() {
        this.id = (0, uuid_1.v4)();
        this.isActive = true;
        this.puppies = new core_1.Collection(this);
        this.createdAt = new Date();
    }
};
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", String)
], WaitingList.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'date' }),
    __metadata("design:type", Date)
], WaitingList.prototype, "date", void 0);
__decorate([
    (0, core_1.Property)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], WaitingList.prototype, "isActive", void 0);
__decorate([
    (0, core_1.OneToMany)(() => puppy_entity_1.Puppy, puppy => puppy.waitingList, {
        cascade: [core_1.Cascade.PERSIST, core_1.Cascade.REMOVE]
    }),
    __metadata("design:type", Object)
], WaitingList.prototype, "puppies", void 0);
__decorate([
    (0, core_1.Property)({ type: 'datetime' }),
    __metadata("design:type", Date)
], WaitingList.prototype, "createdAt", void 0);
WaitingList = __decorate([
    (0, core_1.Entity)({ tableName: 'waiting_lists' })
], WaitingList);
exports.WaitingList = WaitingList;
//# sourceMappingURL=waiting-list.entity.js.map