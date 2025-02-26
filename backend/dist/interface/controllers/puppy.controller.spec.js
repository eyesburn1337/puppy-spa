"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const puppy_controller_1 = require("./puppy.controller");
const postgresql_1 = require("@mikro-orm/postgresql");
const puppy_entity_1 = require("../../core/domain/entities/puppy.entity");
const waiting_list_entity_1 = require("../../core/domain/entities/waiting-list.entity");
describe('PuppyController', () => {
    let controller;
    let entityManager;
    const mockEntityManager = {
        findOne: jest.fn(),
        create: jest.fn(),
        persistAndFlush: jest.fn(),
        count: jest.fn(),
        fork: jest.fn(),
        begin: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        getConnection: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [puppy_controller_1.PuppyController],
            providers: [
                {
                    provide: postgresql_1.EntityManager,
                    useValue: mockEntityManager,
                },
            ],
        }).compile();
        controller = module.get(puppy_controller_1.PuppyController);
        entityManager = module.get(postgresql_1.EntityManager);
    });
    describe('create', () => {
        it('should create a new puppy appointment', async () => {
            const createPuppyDto = {
                petName: 'Max',
                customerName: 'John Doe',
                service: 'Grooming',
                createdAt: new Date().toISOString(),
            };
            const mockWaitingList = new waiting_list_entity_1.WaitingList();
            mockWaitingList.id = '123';
            mockEntityManager.findOne.mockResolvedValueOnce(mockWaitingList);
            mockEntityManager.count.mockResolvedValueOnce(0);
            mockEntityManager.create.mockReturnValueOnce(Object.assign({ id: '456' }, createPuppyDto));
            const result = await controller.create(createPuppyDto);
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.petName).toBe(createPuppyDto.petName);
            expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
        });
    });
    describe('updateAppointment', () => {
        it('should update an existing appointment', async () => {
            const dateStr = '2024-03-20';
            const id = '456';
            const updateData = {
                petName: 'Max Updated',
                customerName: 'John Doe',
                service: 'Bathing',
                appointmentTime: new Date().toISOString(),
                status: 'Completed',
            };
            const mockPuppy = new puppy_entity_1.Puppy();
            Object.assign(mockPuppy, Object.assign({ id }, updateData));
            const mockForkedEm = Object.assign(Object.assign({}, mockEntityManager), { findOne: jest.fn().mockResolvedValueOnce(mockPuppy), persistAndFlush: jest.fn() });
            mockEntityManager.fork.mockReturnValueOnce(mockForkedEm);
            const result = await controller.updateAppointment(dateStr, id, updateData);
            expect(result.success).toBe(true);
            expect(result.puppy).toBeDefined();
            expect(result.puppy.petName).toBe(updateData.petName);
            expect(mockForkedEm.persistAndFlush).toHaveBeenCalled();
        });
        it('should throw error when puppy not found', async () => {
            const dateStr = '2024-03-20';
            const id = 'non-existent';
            const updateData = {
                petName: 'Max',
                customerName: 'John',
                service: 'Grooming',
                appointmentTime: new Date().toISOString(),
                status: 'Pending',
            };
            const mockForkedEm = Object.assign(Object.assign({}, mockEntityManager), { findOne: jest.fn().mockResolvedValueOnce(null) });
            mockEntityManager.fork.mockReturnValueOnce(mockForkedEm);
            await expect(controller.updateAppointment(dateStr, id, updateData)).rejects.toThrow('Puppy not found');
        });
    });
    describe('checkHealth', () => {
        it('should return ok status when database is connected', async () => {
            mockEntityManager.getConnection.mockImplementation(() => ({
                execute: jest.fn().mockResolvedValueOnce([{ result: 1 }]),
            }));
            const result = await controller.checkHealth();
            expect(result.status).toBe('ok');
            expect(result.message).toBe('Database connection successful');
        });
        it('should throw error when database connection fails', async () => {
            mockEntityManager.getConnection.mockImplementation(() => ({
                execute: jest.fn().mockRejectedValueOnce(new Error('Connection failed')),
            }));
            await expect(controller.checkHealth()).rejects.toThrow('Database connection failed');
        });
    });
});
//# sourceMappingURL=puppy.controller.spec.js.map