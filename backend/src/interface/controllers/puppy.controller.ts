import { Controller, Post, Get, Body, Put, Param, Query, BadRequestException, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Puppy } from '../../core/domain/entities/puppy.entity';
import { WaitingList } from '../../core/domain/entities/waiting-list.entity';

@Controller('waiting-list')
export class PuppyController {
  private readonly logger = new Logger(PuppyController.name);

  constructor(private readonly em: EntityManager) {
    this.logger.log('PuppyController initialized');
    this.logger.log('Route prefix: waiting-list');
    this.logger.log('Available routes:');
    this.logger.log('- PUT /api/waiting-list/by-date/:date/:id/service');
    this.logger.log('- GET /api/waiting-list/health');
    // ... log other routes
  }

  @Get('health')
  async checkHealth() {
    try {
      const result = await this.em.getConnection().execute('SELECT 1');
      console.log('Health check result:', result);
      return { status: 'ok', message: 'Database connection successful' };
    } catch (error) {
      console.error('Database connection failed:', error);
      throw new BadRequestException('Database connection failed');
    }
  }

  @Post('create')
  async create(@Body() createPuppyDto: any) {
    this.logger.log('=== Create Puppy Request ===');
    this.logger.log('Body:', createPuppyDto);

    try {
      const appointmentDate = new Date(createPuppyDto.createdAt);
      appointmentDate.setHours(0, 0, 0, 0);

      let waitingList = await this.em.findOne(WaitingList, {
        date: appointmentDate
      });

      if (!waitingList) {
        waitingList = this.em.create(WaitingList, {
          date: appointmentDate,
          isActive: true
        });
        await this.em.persistAndFlush(waitingList);
      }

      const count = await this.em.count(Puppy, {
        waitingList: { id: waitingList.id }
      });
      
      const puppy = this.em.create(Puppy, {
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
    } catch (error) {
      this.logger.error('Failed to create puppy:', error);
      throw new BadRequestException('Failed to create puppy: ' + error.message);
    }
  }

  private async getOrCreateTodaysList() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let waitingList = await this.em.findOne(WaitingList, { date: today });
    
    if (!waitingList) {
      waitingList = this.em.create(WaitingList, {
        date: today,
        isActive: true
      });
      await this.em.persistAndFlush(waitingList);
    }
    
    return waitingList;
  }

  @Get('history')
  async getHistory(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string
  ) {
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      const lists = await this.em.find(WaitingList, {
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
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw new BadRequestException('Failed to fetch history: ' + error.message);
    }
  }

  @Get('search')
  async search(@Query('query') query: string) {
    if (!query || query.length < 2) {
      return { entries: [] };
    }

    try {
      const searchResults = await this.em.find(Puppy, {
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
    } catch (error) {
      console.error('Failed to search:', error);
      throw new BadRequestException('Failed to search: ' + error.message);
    }
  }

  @Get('by-date/:date')
  async getByDate(@Param('date') dateStr: string) {
    try {
      const startDate = new Date(dateStr);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dateStr);
      endDate.setHours(23, 59, 59, 999);
      
      let waitingList = await this.em.findOne(WaitingList, {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      });
      
      if (!waitingList) {
        waitingList = this.em.create(WaitingList, {
          date: startDate,
          isActive: true
        });
        await this.em.persistAndFlush(waitingList);
      }

      const puppies = await this.em.find(Puppy, {
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
    } catch (error) {
      console.error('Failed to get list:', error);
      throw new BadRequestException('Failed to get list: ' + error.message);
    }
  }

  @Get('today')
  async getToday() {
    try {
      const waitingList = await this.getOrCreateTodaysList();

      const puppies = await this.em.find(Puppy, {
        waitingList: { id: waitingList.id }
      }, {
        orderBy: { orderIndex: 'ASC' }
      });

      return {
        dayListId: waitingList.id,
        entries: puppies
      };
    } catch (error) {
      console.error('Failed to get today\'s list:', error);
      throw new BadRequestException('Failed to get today\'s list: ' + error.message);
    }
  }

  @Post('by-date/:date')
  async createForDate(@Param('date') dateStr: string) {
    try {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      
      let waitingList = await this.em.findOne(WaitingList, { date });
      
      if (!waitingList) {
        waitingList = this.em.create(WaitingList, {
          date,
          isActive: true
        });
        await this.em.persistAndFlush(waitingList);
      }

      return {
        dayListId: waitingList.id,
        entries: []
      };
    } catch (error) {
      console.error('Failed to create list:', error);
      throw new BadRequestException('Failed to create list: ' + error.message);
    }
  }

  @Put('by-date/:date/:id/service')
  async toggleService(@Param('date') dateStr: string, @Param('id') id: string) {
    this.logger.log('=== Toggle Service Request ===');
    this.logger.log('Route hit: PUT /api/waiting-list/by-date/:date/:id/service');
    this.logger.log('Parameters:', { dateStr, id });

    const em = this.em.fork(); // Create a new EntityManager instance

    try {
      await em.begin(); // Start transaction

      // Find the puppy directly first
      const puppy = await em.findOne(Puppy, { id }, {
        populate: ['waitingList']
      });
      this.logger.log('Found puppy:', puppy);

      if (!puppy) {
        this.logger.warn('Puppy not found with ID:', id);
        throw new BadRequestException('Puppy not found');
      }

      // Toggle the service status
      puppy.isServiced = !puppy.isServiced;
      this.logger.log('Updated service status to:', puppy.isServiced);

      // Persist the change within transaction
      await em.persistAndFlush(puppy);
      
      // Commit the transaction
      await em.commit();
      
      this.logger.log('Changes persisted successfully');

      // Verify the change was saved
      const updatedPuppy = await em.findOne(Puppy, { id });
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
    } catch (error) {
      await em.rollback(); // Rollback on error
      this.logger.error('Error in toggleService:', error);
      throw new BadRequestException('Failed to toggle service: ' + error.message);
    }
  }

  @Put('by-date/:date/:id/time')
  async updateAppointmentTime(
    @Param('date') dateStr: string,
    @Param('id') id: string,
    @Body() data: { appointmentTime: string }
  ) {
    this.logger.log('=== Update Appointment Time Request ===');
    this.logger.log('Parameters:', { dateStr, id, appointmentTime: data.appointmentTime });

    const em = this.em.fork();

    try {
      await em.begin();

      const puppy = await em.findOne(Puppy, { id });
      if (!puppy) {
        throw new BadRequestException('Puppy not found');
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
    } catch (error) {
      await em.rollback();
      this.logger.error('Error in updateAppointmentTime:', error);
      throw new BadRequestException('Failed to update appointment time: ' + error.message);
    }
  }

  @Put('by-date/:date/:id/status')
  async updateStatus(
    @Param('date') dateStr: string,
    @Param('id') id: string,
    @Body() data: { status: 'Pending' | 'Completed' | 'Cancelled' }
  ) {
    this.logger.log('=== Update Status Request ===');
    this.logger.log('Parameters:', { dateStr, id, status: data.status });

    const em = this.em.fork();

    try {
      await em.begin();

      const puppy = await em.findOne(Puppy, { id });
      if (!puppy) {
        throw new BadRequestException('Puppy not found');
      }

      puppy.status = data.status;
      // Update isServiced for backward compatibility
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
    } catch (error) {
      await em.rollback();
      this.logger.error('Error in updateStatus:', error);
      throw new BadRequestException('Failed to update status: ' + error.message);
    }
  }

  @Put('by-date/:date/:id/update')
  async updateAppointment(
    @Param('date') dateStr: string,
    @Param('id') id: string,
    @Body() data: {
      petName: string;
      customerName: string;
      service: string;
      appointmentTime: string;
      status: 'Pending' | 'Completed' | 'Cancelled';
    }
  ) {
    this.logger.log('=== Update Appointment Request ===');
    this.logger.log('Parameters:', { dateStr, id, data });

    const em = this.em.fork();

    try {
      await em.begin();

      const puppy = await em.findOne(Puppy, { id });
      if (!puppy) {
        throw new BadRequestException('Puppy not found');
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
    } catch (error) {
      await em.rollback();
      this.logger.error('Error in updateAppointment:', error);
      throw new BadRequestException('Failed to update appointment: ' + error.message);
    }
  }
} 