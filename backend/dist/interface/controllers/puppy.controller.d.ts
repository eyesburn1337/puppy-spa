import { EntityManager } from '@mikro-orm/postgresql';
import { Puppy } from '../../core/domain/entities/puppy.entity';
import { WaitingList } from '../../core/domain/entities/waiting-list.entity';
export declare class PuppyController {
    private readonly em;
    private readonly logger;
    constructor(em: EntityManager);
    checkHealth(): Promise<{
        status: string;
        message: string;
    }>;
    create(createPuppyDto: any): Promise<{
        appointmentTime: string;
        createdAt: string;
        id: string;
        petName: string;
        customerName: string;
        service: string;
        isServiced: boolean;
        orderIndex: number;
        waitingList: WaitingList;
        status: "Pending" | "Completed" | "Cancelled";
    }>;
    private getOrCreateTodaysList;
    getHistory(startDateStr: string, endDateStr: string): Promise<{
        entries: {
            id: string;
            date: Date;
            totalPuppies: number;
            servicedPuppies: number;
            cancelledPuppies: number;
            revenue: any;
            puppies: {
                petName: string;
                customerName: string;
                service: string;
                isServiced: boolean;
                status: "Pending" | "Completed" | "Cancelled";
                appointmentTime: string;
            }[];
        }[];
    }>;
    search(query: string): Promise<{
        entries: {
            id: string;
            petName: string;
            customerName: string;
            service: string;
            isServiced: boolean;
            appointmentTime: string;
            visitDate: string;
            status: string;
        }[];
    }>;
    getByDate(dateStr: string): Promise<{
        dayListId: string;
        entries: {
            id: string;
            petName: string;
            customerName: string;
            service: string;
            appointmentTime: string;
            isServiced: boolean;
            status: "Pending" | "Completed" | "Cancelled";
            orderIndex: number;
            createdAt: string;
        }[];
    }>;
    getToday(): Promise<{
        dayListId: string;
        entries: import("@mikro-orm/core").Loaded<Puppy, never>[];
    }>;
    createForDate(dateStr: string): Promise<{
        dayListId: string;
        entries: any[];
    }>;
    toggleService(dateStr: string, id: string): Promise<{
        success: boolean;
        puppy: {
            id: string;
            isServiced: boolean;
            petName: string;
            service: string;
        };
    }>;
    updateAppointmentTime(dateStr: string, id: string, data: {
        appointmentTime: string;
    }): Promise<{
        success: boolean;
        puppy: {
            id: string;
            appointmentTime: string;
        };
    }>;
    updateStatus(dateStr: string, id: string, data: {
        status: 'Pending' | 'Completed' | 'Cancelled';
    }): Promise<{
        success: boolean;
        puppy: {
            id: string;
            status: "Pending" | "Completed" | "Cancelled";
            isServiced: boolean;
        };
    }>;
    updateAppointment(dateStr: string, id: string, data: {
        petName: string;
        customerName: string;
        service: string;
        appointmentTime: string;
        status: 'Pending' | 'Completed' | 'Cancelled';
    }): Promise<{
        success: boolean;
        puppy: {
            id: string;
            petName: string;
            customerName: string;
            service: string;
            appointmentTime: string;
            status: "Pending" | "Completed" | "Cancelled";
        };
    }>;
}
