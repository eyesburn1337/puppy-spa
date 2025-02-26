"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const waiting_list_controller_1 = require("./waiting-list.controller");
const postgresql_1 = require("@mikro-orm/postgresql");
const waiting_list_entity_1 = require("../../core/domain/entities/waiting-list.entity");
const core_1 = require("@mikro-orm/core");
describe('WaitingListController', () => {
    let controller;
    let entityManager;
    const mockEntityManager = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        persistAndFlush: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [waiting_list_controller_1.WaitingListController],
            providers: [
                {
                    provide: postgresql_1.EntityManager,
                    useValue: mockEntityManager,
                },
            ],
        }).compile();
        controller = module.get(waiting_list_controller_1.WaitingListController);
        entityManager = module.get(postgresql_1.EntityManager);
    });
    describe('createTodayList', () => {
        it('should create a new list if none exists', async () => {
            mockEntityManager.findOne.mockResolvedValueOnce(null);
            const mockList = new waiting_list_entity_1.WaitingList();
            mockEntityManager.create.mockReturnValueOnce(mockList);
            const result = await controller.createTodayList();
            expect(result).toBeDefined();
            expect(mockEntityManager.create).toHaveBeenCalled();
            expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(mockList);
        });
        it('should return existing list if found', async () => {
            const existingList = new waiting_list_entity_1.WaitingList();
            existingList.id = '123';
            mockEntityManager.findOne.mockResolvedValueOnce(existingList);
            const result = await controller.createTodayList();
            expect(result).toBe(existingList);
            expect(mockEntityManager.create).not.toHaveBeenCalled();
        });
    });
    describe('getHistory', () => {
        it('should return formatted history data', async () => {
            const mockPuppies = [
                {
                    id: '1',
                    service: 'Grooming',
                    isServiced: true,
                    orderIndex: 0,
                },
                {
                    id: '2',
                    service: 'Bathing',
                    isServiced: false,
                    orderIndex: 1,
                },
            ];
            const mockList = new waiting_list_entity_1.WaitingList();
            mockList.id = '123';
            mockList.puppies = new core_1.Collection(mockList, mockPuppies);
            mockEntityManager.find.mockResolvedValueOnce([mockList]);
            const result = await controller.getHistory(new Date(), new Date());
            expect(result).toHaveLength(1);
            expect(result[0].totalPuppies).toBe(2);
            expect(result[0].servicedPuppies).toBe(1);
            expect(result[0].revenue).toBe(80);
        });
    });
});
//# sourceMappingURL=waiting-list.controller.spec.js.map