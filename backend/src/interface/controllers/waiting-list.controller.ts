import { Controller, Post, Get, Body, InternalServerErrorException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { WaitingList } from '../../core/domain/entities/waiting-list.entity';

@Controller('waiting-lists')
export class WaitingListController {
  constructor(private readonly em: EntityManager) {}

  @Post('today')
  async createTodayList() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if list already exists for today
      let todayList = await this.em.findOne(WaitingList, { date: today });

      if (!todayList) {
        todayList = this.em.create(WaitingList, {
          date: today,
          isActive: true
        });
        await this.em.persistAndFlush(todayList);
        console.log('Created new list for today:', todayList);
      }

      return todayList;
    } catch (error) {
      console.error('Error in createTodayList:', error);
      throw new InternalServerErrorException('Failed to create today\'s list: ' + error.message);
    }
  }

  @Get('today')
  async getTodayList() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log('Fetching list for date:', today);

      // First, ensure we have a list for today
      let todayList = await this.em.findOne(WaitingList, { date: today });

      if (!todayList) {
        console.log('No list found for today, creating new one');
        todayList = this.em.create(WaitingList, {
          date: today,
          isActive: true
        });
        await this.em.persistAndFlush(todayList);
      }

      // Now fetch the list with puppies
      const listWithPuppies = await this.em.findOne(WaitingList, { date: today }, {
        populate: ['puppies']
      });

      console.log('Found list with puppies:', listWithPuppies);

      return listWithPuppies;
    } catch (error) {
      console.error('Error in getTodayList:', error);
      throw new InternalServerErrorException('Failed to fetch today\'s list: ' + error.message);
    }
  }

  @Get('history')
  async getHistory(
    @Body('startDate') startDate: Date,
    @Body('endDate') endDate: Date
  ) {
    const lists = await this.em.find(WaitingList, {
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
} 