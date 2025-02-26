'use client';

import { format } from 'date-fns';
import type { WaitingListEntry } from '@/types';
import type { ServiceType } from '@/types/services';
import { PRICES } from '@/constants/prices';

interface Props {
  waitingList: WaitingListEntry[];
  selectedDate: string;
}

// Type guard function
function isValidService(service: string): service is ServiceType {
  return Object.keys(PRICES).includes(service);
}

export default function DashboardStats({ waitingList, selectedDate }: Props) {
  const stats = {
    total: waitingList.length,
    completed: waitingList.filter((entry: WaitingListEntry) => entry.status === 'Completed').length,
    pending: waitingList.filter((entry: WaitingListEntry) => entry.status === 'Pending').length,
    cancelled: waitingList.filter((entry: WaitingListEntry) => entry.status === 'Cancelled').length,
    revenue: waitingList.reduce((sum, entry) => {
      if (entry.status === 'Completed' && isValidService(entry.service)) {
        return sum + PRICES[entry.service];
      }
      return sum;
    }, 0)
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="bg-white overflow-hidden shadow-md rounded-lg">
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <dt className="text-xs font-medium text-gray-500 truncate">Total</dt>
              <dd className="text-xl font-semibold text-gray-900">{stats.total}</dd>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-md rounded-lg">
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <dt className="text-xs font-medium text-gray-500 truncate">Pending</dt>
              <dd className="text-xl font-semibold text-gray-900">{stats.pending}</dd>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-md rounded-lg">
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <dt className="text-xs font-medium text-gray-500 truncate">Completed</dt>
              <dd className="text-xl font-semibold text-gray-900">{stats.completed}</dd>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-md rounded-lg">
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <dt className="text-xs font-medium text-gray-500 truncate">Cancelled</dt>
              <dd className="text-xl font-semibold text-gray-900">{stats.cancelled}</dd>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-md rounded-lg">
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <dt className="text-xs font-medium text-gray-500 truncate">Revenue</dt>
              <dd className="text-xl font-semibold text-gray-900">${stats.revenue.toFixed(2)}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 