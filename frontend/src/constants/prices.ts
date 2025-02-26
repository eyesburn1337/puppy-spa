import { ServiceType } from '@/types/services';

export const PRICES: Record<ServiceType, number> = {
  'Grooming': 50,
  'Bathing': 30,
  'Nail Trimming': 20
} as const; 