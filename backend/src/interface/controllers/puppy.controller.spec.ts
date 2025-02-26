import { Test, TestingModule } from '@nestjs/testing';
import { PuppyController } from './puppy.controller';
import { EntityManager } from '@mikro-orm/postgresql';
import { Puppy } from '../../core/domain/entities/puppy.entity';
import { WaitingList } from '../../core/domain/entities/waiting-list.entity';

describe('PuppyController', () => {
  let controller: PuppyController;
  let entityManager: EntityManager;

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuppyController],
      providers: [
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    controller = module.get<PuppyController>(PuppyController);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  describe('create', () => {
    it('should create a new puppy appointment', async () => {
      // Arrange
      const createPuppyDto = {
        petName: 'Max',
        customerName: 'John Doe',
        service: 'Grooming',
        createdAt: new Date().toISOString(),
      };

      const mockWaitingList = new WaitingList();
      mockWaitingList.id = '123';

      mockEntityManager.findOne.mockResolvedValueOnce(mockWaitingList);
      mockEntityManager.count.mockResolvedValueOnce(0);
      mockEntityManager.create.mockReturnValueOnce({
        id: '456',
        ...createPuppyDto,
      });

      // Act
      const result = await controller.create(createPuppyDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.petName).toBe(createPuppyDto.petName);
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
    });
  });

  describe('updateAppointment', () => {
    it('should update an existing appointment', async () => {
      // Arrange
      const dateStr = '2024-03-20';
      const id = '456';
      const updateData = {
        petName: 'Max Updated',
        customerName: 'John Doe',
        service: 'Bathing',
        appointmentTime: new Date().toISOString(),
        status: 'Completed' as const,
      };

      const mockPuppy = new Puppy();
      Object.assign(mockPuppy, { id, ...updateData });

      const mockForkedEm = {
        ...mockEntityManager,
        findOne: jest.fn().mockResolvedValueOnce(mockPuppy),
        persistAndFlush: jest.fn(),
      };

      mockEntityManager.fork.mockReturnValueOnce(mockForkedEm);

      // Act
      const result = await controller.updateAppointment(dateStr, id, updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.puppy).toBeDefined();
      expect(result.puppy.petName).toBe(updateData.petName);
      expect(mockForkedEm.persistAndFlush).toHaveBeenCalled();
    });

    it('should throw error when puppy not found', async () => {
      // Arrange
      const dateStr = '2024-03-20';
      const id = 'non-existent';
      const updateData = {
        petName: 'Max',
        customerName: 'John',
        service: 'Grooming',
        appointmentTime: new Date().toISOString(),
        status: 'Pending' as const,
      };

      const mockForkedEm = {
        ...mockEntityManager,
        findOne: jest.fn().mockResolvedValueOnce(null),
      };

      mockEntityManager.fork.mockReturnValueOnce(mockForkedEm);

      // Act & Assert
      await expect(
        controller.updateAppointment(dateStr, id, updateData)
      ).rejects.toThrow('Puppy not found');
    });
  });

  describe('checkHealth', () => {
    it('should return ok status when database is connected', async () => {
      // Arrange
      mockEntityManager.getConnection.mockImplementation(() => ({
        execute: jest.fn().mockResolvedValueOnce([{ result: 1 }]),
      }));

      // Act
      const result = await controller.checkHealth();

      // Assert
      expect(result.status).toBe('ok');
      expect(result.message).toBe('Database connection successful');
    });

    it('should throw error when database connection fails', async () => {
      // Arrange
      mockEntityManager.getConnection.mockImplementation(() => ({
        execute: jest.fn().mockRejectedValueOnce(new Error('Connection failed')),
      }));

      // Act & Assert
      await expect(controller.checkHealth()).rejects.toThrow('Database connection failed');
    });
  });
}); 