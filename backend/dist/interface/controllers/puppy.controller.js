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
var PuppyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppyController = void 0;
const common_1 = require("@nestjs/common");
const postgresql_1 = require("@mikro-orm/postgresql");
const puppy_entity_1 = require("../../core/domain/entities/puppy.entity");
const waiting_list_entity_1 = require("../../core/domain/entities/waiting-list.entity");
let PuppyController = PuppyController_1 = class PuppyController {
    constructor(em) {
        this.em = em;
        this.logger = new common_1.Logger(PuppyController_1.name);
        this.logger.log('PuppyController initialized');
        this.logger.log('Route prefix: waiting-list');
        this.logger.log('Available routes:');
        this.logger.log('- PUT /api/waiting-list/by-date/:date/:id/service');
        this.logger.log('- GET /api/waiting-list/health');
    }
    async checkHealth() {
        try {
            const result = await this.em.getConnection().execute('SELECT 1');
            console.log('Health check result:', result);
            return { status: 'ok', message: 'Database connection successful' };
        }
        catch (error) {
            console.error('Database connection failed:', error);
            throw new common_1.BadRequestException('Database connection failed');
        }
    }
    async create(createPuppyDto) {
        this.logger.log('=== Create Puppy Request ===');
        this.logger.log('Body:', createPuppyDto);
        try {
            const appointmentDate = new Date(createPuppyDto.createdAt);
            appointmentDate.setHours(0, 0, 0, 0);
            let waitingList = await this.em.findOne(waiting_list_entity_1.WaitingList, {
                date: appointmentDate
            });
            if (!waitingList) {
                waitingList = this.em.create(waiting_list_entity_1.WaitingList, {
                    date: appointmentDate,
                    isActive: true
                });
                await this.em.persistAndFlush(waitingList);
            }
            const count = await this.em.count(puppy_entity_1.Puppy, {
                waitingList: { id: waitingList.id }
            });
            const puppy = this.em.create(puppy_entity_1.Puppy, {
                petName: createPuppyDto.petName,
                customerName: createPuppyDto.customerName,
                service: createPuppyDto.service,
                appointmentTime: new Date(createPuppyDto.createdAt),
                orderIndex: count,
                isServiced: false,
                status: 'Pending',
                createdAt: new Date(),
                waitingList
            });
            await this.em.persistAndFlush(puppy);
            return {
                ...puppy,
                appointmentTime: puppy.appointmentTime.toISOString(),
                createdAt: puppy.createdAt.toISOString()
            };
        }
        catch (error) {
            this.logger.error('Failed to create puppy:', error);
            throw new common_1.BadRequestException('Failed to create puppy: ' + error.message);
        }
    }
    async getOrCreateTodaysList() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let waitingList = await this.em.findOne(waiting_list_entity_1.WaitingList, { date: today });
        if (!waitingList) {
            waitingList = this.em.create(waiting_list_entity_1.WaitingList, {
                date: today,
                isActive: true
            });
            await this.em.persistAndFlush(waitingList);
        }
        return waitingList;
    }
    async getHistory(startDateStr, endDateStr) {
        try {
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            const lists = await this.em.find(waiting_list_entity_1.WaitingList, {
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }, {
                populate: ['puppies'],
                orderBy: { date: 'DESC' }
            });
            const entries = lists.map(list => ({
                id: list.id,
                date: list.date,
                totalPuppies: list.puppies.length,
                servicedPuppies: list.puppies.filter(p => p.status === 'Completed').length,
                cancelledPuppies: list.puppies.filter(p => p.status === 'Cancelled').length,
                revenue: list.puppies.reduce((sum, puppy) => {
                    const prices = {
                        'Grooming': 50,
                        'Bathing': 30,
                        'Nail Trimming': 20
                    };
                    return puppy.status === 'Completed' ? sum + (prices[puppy.service] || 0) : sum;
                }, 0),
                puppies: list.puppies.map(puppy => ({
                    petName: puppy.petName,
                    customerName: puppy.customerName,
                    service: puppy.service,
                    isServiced: puppy.isServiced,
                    status: puppy.status,
                    appointmentTime: puppy.appointmentTime.toISOString()
                }))
            }));
            return { entries };
        }
        catch (error) {
            console.error('Failed to fetch history:', error);
            throw new common_1.BadRequestException('Failed to fetch history: ' + error.message);
        }
    }
    async search(query) {
        if (!query || query.length < 2) {
            return { entries: [] };
        }
        try {
            const searchResults = await this.em.find(puppy_entity_1.Puppy, {
                $or: [
                    { petName: { $ilike: `%${query}%` } },
                    { customerName: { $ilike: `%${query}%` } }
                ]
            }, {
                orderBy: { appointmentTime: 'ASC' },
                populate: ['waitingList']
            });
            return {
                entries: searchResults.map(puppy => ({
                    id: puppy.id,
                    petName: puppy.petName,
                    customerName: puppy.customerName,
                    service: puppy.service,
                    isServiced: puppy.isServiced,
                    appointmentTime: puppy.appointmentTime.toISOString(),
                    visitDate: puppy.appointmentTime.toLocaleDateString(),
                    status: puppy.isServiced ? 'Completed' : 'Pending'
                }))
            };
        }
        catch (error) {
            console.error('Failed to search:', error);
            throw new common_1.BadRequestException('Failed to search: ' + error.message);
        }
    }
    async getByDate(dateStr) {
        try {
            const startDate = new Date(dateStr);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(dateStr);
            endDate.setHours(23, 59, 59, 999);
            let waitingList = await this.em.findOne(waiting_list_entity_1.WaitingList, {
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            });
            if (!waitingList) {
                waitingList = this.em.create(waiting_list_entity_1.WaitingList, {
                    date: startDate,
                    isActive: true
                });
                await this.em.persistAndFlush(waitingList);
            }
            const puppies = await this.em.find(puppy_entity_1.Puppy, {
                waitingList: { id: waitingList.id }
            }, {
                orderBy: { orderIndex: 'ASC' }
            });
            return {
                dayListId: waitingList.id,
                entries: puppies.map(puppy => ({
                    id: puppy.id,
                    petName: puppy.petName,
                    customerName: puppy.customerName,
                    service: puppy.service,
                    appointmentTime: puppy.appointmentTime.toISOString(),
                    isServiced: puppy.isServiced,
                    status: puppy.status,
                    orderIndex: puppy.orderIndex,
                    createdAt: puppy.createdAt.toISOString()
                }))
            };
        }
        catch (error) {
            console.error('Failed to get list:', error);
            throw new common_1.BadRequestException('Failed to get list: ' + error.message);
        }
    }
    async getToday() {
        try {
            const waitingList = await this.getOrCreateTodaysList();
            const puppies = await this.em.find(puppy_entity_1.Puppy, {
                waitingList: { id: waitingList.id }
            }, {
                orderBy: { orderIndex: 'ASC' }
            });
            return {
                dayListId: waitingList.id,
                entries: puppies
            };
        }
        catch (error) {
            console.error('Failed to get today\'s list:', error);
            throw new common_1.BadRequestException('Failed to get today\'s list: ' + error.message);
        }
    }
    async createForDate(dateStr) {
        try {
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            let waitingList = await this.em.findOne(waiting_list_entity_1.WaitingList, { date });
            if (!waitingList) {
                waitingList = this.em.create(waiting_list_entity_1.WaitingList, {
                    date,
                    isActive: true
                });
                await this.em.persistAndFlush(waitingList);
            }
            return {
                dayListId: waitingList.id,
                entries: []
            };
        }
        catch (error) {
            console.error('Failed to create list:', error);
            throw new common_1.BadRequestException('Failed to create list: ' + error.message);
        }
    }
    async toggleService(dateStr, id) {
        this.logger.log('=== Toggle Service Request ===');
        this.logger.log('Route hit: PUT /api/waiting-list/by-date/:date/:id/service');
        this.logger.log('Parameters:', { dateStr, id });
        const em = this.em.fork();
        try {
            await em.begin();
            const puppy = await em.findOne(puppy_entity_1.Puppy, { id }, {
                populate: ['waitingList']
            });
            this.logger.log('Found puppy:', puppy);
            if (!puppy) {
                this.logger.warn('Puppy not found with ID:', id);
                throw new common_1.BadRequestException('Puppy not found');
            }
            puppy.isServiced = !puppy.isServiced;
            this.logger.log('Updated service status to:', puppy.isServiced);
            await em.persistAndFlush(puppy);
            await em.commit();
            this.logger.log('Changes persisted successfully');
            const updatedPuppy = await em.findOne(puppy_entity_1.Puppy, { id });
            this.logger.log('Verified puppy after update:', updatedPuppy);
            return {
                success: true,
                puppy: {
                    id: puppy.id,
                    isServiced: puppy.isServiced,
                    petName: puppy.petName,
                    service: puppy.service
                }
            };
        }
        catch (error) {
            await em.rollback();
            this.logger.error('Error in toggleService:', error);
            throw new common_1.BadRequestException('Failed to toggle service: ' + error.message);
        }
    }
    async updateAppointmentTime(dateStr, id, data) {
        this.logger.log('=== Update Appointment Time Request ===');
        this.logger.log('Parameters:', { dateStr, id, appointmentTime: data.appointmentTime });
        const em = this.em.fork();
        try {
            await em.begin();
            const puppy = await em.findOne(puppy_entity_1.Puppy, { id });
            if (!puppy) {
                throw new common_1.BadRequestException('Puppy not found');
            }
            puppy.appointmentTime = new Date(data.appointmentTime);
            await em.persistAndFlush(puppy);
            await em.commit();
            return {
                success: true,
                puppy: {
                    id: puppy.id,
                    appointmentTime: puppy.appointmentTime.toISOString()
                }
            };
        }
        catch (error) {
            await em.rollback();
            this.logger.error('Error in updateAppointmentTime:', error);
            throw new common_1.BadRequestException('Failed to update appointment time: ' + error.message);
        }
    }
    async updateStatus(dateStr, id, data) {
        this.logger.log('=== Update Status Request ===');
        this.logger.log('Parameters:', { dateStr, id, status: data.status });
        const em = this.em.fork();
        try {
            await em.begin();
            const puppy = await em.findOne(puppy_entity_1.Puppy, { id });
            if (!puppy) {
                throw new common_1.BadRequestException('Puppy not found');
            }
            puppy.status = data.status;
            puppy.isServiced = data.status === 'Completed';
            await em.persistAndFlush(puppy);
            await em.commit();
            return {
                success: true,
                puppy: {
                    id: puppy.id,
                    status: puppy.status,
                    isServiced: puppy.isServiced
                }
            };
        }
        catch (error) {
            await em.rollback();
            this.logger.error('Error in updateStatus:', error);
            throw new common_1.BadRequestException('Failed to update status: ' + error.message);
        }
    }
    async updateAppointment(dateStr, id, data) {
        this.logger.log('=== Update Appointment Request ===');
        this.logger.log('Parameters:', { dateStr, id, data });
        const em = this.em.fork();
        try {
            await em.begin();
            const puppy = await em.findOne(puppy_entity_1.Puppy, { id });
            if (!puppy) {
                throw new common_1.BadRequestException('Puppy not found');
            }
            puppy.petName = data.petName;
            puppy.customerName = data.customerName;
            puppy.service = data.service;
            puppy.appointmentTime = new Date(data.appointmentTime);
            puppy.status = data.status;
            puppy.isServiced = data.status === 'Completed';
            await em.persistAndFlush(puppy);
            await em.commit();
            return {
                success: true,
                puppy: {
                    id: puppy.id,
                    petName: puppy.petName,
                    customerName: puppy.customerName,
                    service: puppy.service,
                    appointmentTime: puppy.appointmentTime.toISOString(),
                    status: puppy.status
                }
            };
        }
        catch (error) {
            await em.rollback();
            this.logger.error('Error in updateAppointment:', error);
            throw new common_1.BadRequestException('Failed to update appointment: ' + error.message);
        }
    }
};
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('by-date/:date'),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "getByDate", null);
__decorate([
    (0, common_1.Get)('today'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "getToday", null);
__decorate([
    (0, common_1.Post)('by-date/:date'),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "createForDate", null);
__decorate([
    (0, common_1.Put)('by-date/:date/:id/service'),
    __param(0, (0, common_1.Param)('date')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "toggleService", null);
__decorate([
    (0, common_1.Put)('by-date/:date/:id/time'),
    __param(0, (0, common_1.Param)('date')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "updateAppointmentTime", null);
__decorate([
    (0, common_1.Put)('by-date/:date/:id/status'),
    __param(0, (0, common_1.Param)('date')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)('by-date/:date/:id/update'),
    __param(0, (0, common_1.Param)('date')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PuppyController.prototype, "updateAppointment", null);
PuppyController = PuppyController_1 = __decorate([
    (0, common_1.Controller)('waiting-list'),
    __metadata("design:paramtypes", [postgresql_1.EntityManager])
], PuppyController);
exports.PuppyController = PuppyController;
//# sourceMappingURL=puppy.controller.js.map