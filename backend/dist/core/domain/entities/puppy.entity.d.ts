import { WaitingList } from './waiting-list.entity';
export declare class Puppy {
    id: string;
    petName: string;
    customerName: string;
    service: string;
    appointmentTime: Date;
    isServiced: boolean;
    orderIndex: number;
    createdAt: Date;
    waitingList: WaitingList;
    status: 'Pending' | 'Completed' | 'Cancelled';
}
