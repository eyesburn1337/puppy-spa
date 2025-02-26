import { Entity, Property, PrimaryKey, ManyToOne } from '@mikro-orm/core';
import { WaitingList } from './waiting-list.entity';
import { v4 } from 'uuid';

@Entity({ tableName: 'puppies' })
export class Puppy {
  @PrimaryKey()
  id: string = v4();

  @Property({ type: 'string' })
  petName: string;

  @Property({ type: 'string' })
  customerName: string;

  @Property({ type: 'string' })
  service: string;

  @Property({ type: 'datetime' })
  appointmentTime: Date;

  @Property({ type: 'boolean', default: false })
  isServiced: boolean = false;

  @Property({ type: 'integer', default: 0 })
  orderIndex: number = 0;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @ManyToOne(() => WaitingList, { nullable: false })
  waitingList!: WaitingList;

  @Property()
  status: 'Pending' | 'Completed' | 'Cancelled' = 'Pending';
} 