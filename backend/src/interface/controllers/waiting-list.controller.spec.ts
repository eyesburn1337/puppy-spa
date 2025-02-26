import { Test, TestingModule } from '@nestjs/testing';
import { WaitingListController } from './waiting-list.controller';
import { EntityManager } from '@mikro-orm/postgresql';
import { WaitingList } from '../../core/domain/entities/waiting-list.entity';
import { Collection } from '@mikro-orm/core';

describe('WaitingListController', () => {
  let controller: WaitingListController;
  let entityManager: EntityManager;

  const mockEntityManager = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    persistAndFlush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaitingListController],
      providers: [
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    controller = module.get<WaitingListController>(WaitingListController);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  describe('createTodayList', () => {
    it('should create a new list if none exists', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(null);
      const mockList = new WaitingList();
      mockEntityManager.create.mockReturnValueOnce(mockList);

      // Act
      const result = await controller.createTodayList();

      // Assert
      expect(result).toBeDefined();
      expect(mockEntityManager.create).toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(mockList);
    });

    it('should return existing list if found', async () => {
      // Arrange
      const existingList = new WaitingList();
      existingList.id = '123';
      mockEntityManager.findOne.mockResolvedValueOnce(existingList);

      // Act
      const result = await controller.createTodayList();

      // Assert
      expect(result).toBe(existingList);
      expect(mockEntityManager.create).not.toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return formatted history data', async () => {
      // Arrange
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

      const mockList = new WaitingList();
      mockList.id = '123';
      mockList.puppies = new Collection<any>(mockList, mockPuppies);

      mockEntityManager.find.mockResolvedValueOnce([mockList]);

      // Act
      const result = await controller.getHistory(new Date(), new Date());

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].totalPuppies).toBe(2);
      expect(result[0].servicedPuppies).toBe(1);
      expect(result[0].revenue).toBe(80); // 50 for Grooming + 30 for Bathing
    });
  });
}); 