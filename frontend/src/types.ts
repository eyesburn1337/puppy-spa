export type ServiceStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface WaitingListEntry {
  id: string;
  petName: string;
  customerName: string;
  service: string;
  appointmentTime: string;
  isServiced: boolean;
  status: ServiceStatus;
  orderIndex: number;
  createdAt: string;
} 