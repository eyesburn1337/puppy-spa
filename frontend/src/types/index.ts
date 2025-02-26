import type { ServiceType } from './services';

export type ServiceStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface WaitingListEntry {
  id: string;
  petName: string;
  customerName: string;
  service: ServiceType;
  appointmentTime: string;
  isServiced: boolean;
  status: ServiceStatus;
  orderIndex: number;
  createdAt: string;
}

export interface WaitingListResponse {
  dayListId: string;
  entries: WaitingListEntry[];
}

export interface HistoricalEntry {
  id: string;
  date: string;
  totalPuppies: number;
  servicedPuppies: number;
  cancelledPuppies: number;
  revenue: number;
  puppies: WaitingListEntry[];
}

export interface HistoryEntry {
  id: string;
  date: string;
  totalPuppies: number;
  servicedPuppies: number;
  revenue: number;
  puppies: Array<{
    petName: string;
    customerName: string;
    service: ServiceType;
    isServiced: boolean;
    status: ServiceStatus;
    appointmentTime: string;
  }>;
}