import { Collection } from '@mikro-orm/core';
import { Puppy } from './puppy.entity';
export declare class WaitingList {
    id: string;
    date: Date;
    isActive: boolean;
    puppies: Collection<Puppy, object>;
    createdAt: Date;
}
