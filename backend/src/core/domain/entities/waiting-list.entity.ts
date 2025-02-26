import { Entity, Property, PrimaryKey, Collection, OneToMany, Cascade } from '@mikro-orm/core';
import { Puppy } from './puppy.entity';
import { v4 } from 'uuid';

@Entity({ tableName: 'waiting_lists' })
export class WaitingList {
  @PrimaryKey()
  id: string = v4();

  @Property({ type: 'date' })
  date: Date;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @OneToMany(() => Puppy, puppy => puppy.waitingList, { 
    cascade: [Cascade.PERSIST, Cascade.REMOVE]
  })
  puppies = new Collection<Puppy>(this);

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();
} 