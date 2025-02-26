import { EntityManager } from '@mikro-orm/postgresql';
import { WaitingList } from '../../core/domain/entities/waiting-list.entity';
export declare class WaitingListController {
    private readonly em;
    constructor(em: EntityManager);
    createTodayList(): Promise<import("@mikro-orm/core").Loaded<WaitingList, never>>;
    getTodayList(): Promise<import("@mikro-orm/core").Loaded<WaitingList, "puppies">>;
    getHistory(startDate: Date, endDate: Date): Promise<{
        id: string;
        date: Date;
        totalPuppies: number;
        servicedPuppies: number;
        revenue: any;
        puppies: import("../../core/domain/entities/puppy.entity").Puppy[];
    }[]>;
}
