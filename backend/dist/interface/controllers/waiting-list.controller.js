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
exports.WaitingListController = void 0;
const common_1 = require("@nestjs/common");
const postgresql_1 = require("@mikro-orm/postgresql");
const waiting_list_entity_1 = require("../../core/domain/entities/waiting-list.entity");
let WaitingListController = class WaitingListController {
    constructor(em) {
        this.em = em;
    }
    async createTodayList() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let todayList = await this.em.findOne(waiting_list_entity_1.WaitingList, { date: today });
            if (!todayList) {
                todayList = this.em.create(waiting_list_entity_1.WaitingList, {
                    date: today,
                    isActive: true
                });
                await this.em.persistAndFlush(todayList);
                console.log('Created new list for today:', todayList);
            }
            return todayList;
        }
        catch (error) {
            console.error('Error in createTodayList:', error);
            throw new common_1.InternalServerErrorException('Failed to create today\'s list: ' + error.message);
        }
    }
    async getTodayList() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            console.log('Fetching list for date:', today);
            let todayList = await this.em.findOne(waiting_list_entity_1.WaitingList, { date: today });
            if (!todayList) {
                console.log('No list found for today, creating new one');
                todayList = this.em.create(waiting_list_entity_1.WaitingList, {
                    date: today,
                    isActive: true
                });
                await this.em.persistAndFlush(todayList);
            }
            const listWithPuppies = await this.em.findOne(waiting_list_entity_1.WaitingList, { date: today }, {
                populate: ['puppies']
            });
            console.log('Found list with puppies:', listWithPuppies);
            return listWithPuppies;
        }
        catch (error) {
            console.error('Error in getTodayList:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch today\'s list: ' + error.message);
        }
    }
    async getHistory(startDate, endDate) {
        const lists = await this.em.find(waiting_list_entity_1.WaitingList, {
            date: { $gte: startDate, $lte: endDate }
        }, {
            populate: ['puppies'],
            orderBy: { date: 'DESC' }
        });
        return lists.map(list => ({
            id: list.id,
            date: list.date,
            totalPuppies: list.puppies.length,
            servicedPuppies: list.puppies.filter(p => p.isServiced).length,
            revenue: list.puppies.reduce((sum, puppy) => {
                const prices = {
                    'Grooming': 50,
                    'Bathing': 30,
                    'Nail Trimming': 20
                };
                return sum + (prices[puppy.service] || 0);
            }, 0),
            puppies: list.puppies.getItems().sort((a, b) => a.orderIndex - b.orderIndex)
        }));
    }
};
__decorate([
    (0, common_1.Post)('today'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WaitingListController.prototype, "createTodayList", null);
__decorate([
    (0, common_1.Get)('today'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WaitingListController.prototype, "getTodayList", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Body)('startDate')),
    __param(1, (0, common_1.Body)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date]),
    __metadata("design:returntype", Promise)
], WaitingListController.prototype, "getHistory", null);
WaitingListController = __decorate([
    (0, common_1.Controller)('waiting-lists'),
    __metadata("design:paramtypes", [postgresql_1.EntityManager])
], WaitingListController);
exports.WaitingListController = WaitingListController;
//# sourceMappingURL=waiting-list.controller.js.map