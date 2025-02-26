'use client';

import { format } from 'date-fns';
import type { WaitingListEntry } from '@/types';
import { apiClient } from '@/utils/api-client';

interface Props {
  waitingList: WaitingListEntry[];
  selectedDate: string;
  onUpdate: () => void;
}

export default function WaitingList({ waitingList, selectedDate, onUpdate }: Props) {
  const toggleService = async (id: string) => {
    try {
      console.log('=== Toggle Service Start ===');
      console.log('Selected date:', selectedDate);
      console.log('Puppy ID:', id);

      const rawDate = new Date(selectedDate);
      const formattedDate = format(rawDate, 'yyyy-MM-dd');
      
      // Construct the URL carefully
      const baseUrl = 'http://localhost:3001';
      const apiPrefix = '/api';
      const path = `/waiting-list/by-date/${formattedDate}/${id}/service`;
      const fullUrl = `${baseUrl}${apiPrefix}${path}`;
      
      console.log('Request URL:', {
        baseUrl,
        apiPrefix,
        path,
        fullUrl
      });

      const result = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Response:', {
        status: result.status,
        statusText: result.statusText,
        url: result.url
      });

      const data = await result.json();
      console.log('Response data:', data);

      if (data.success) {
        console.log('Service toggled successfully:', data.puppy);
        onUpdate();
      } else {
        console.error('Failed to toggle service:', data.message);
      }
    } catch (error) {
      console.error('Error in toggleService:', error);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pet Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {waitingList.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(entry.appointmentTime), 'h:mm a')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.petName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${entry.service === 'Grooming' ? 'bg-purple-100 text-purple-800' :
                      entry.service === 'Bathing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }
                  `}>
                    {entry.service}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${entry.isServiced ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  `}>
                    {entry.isServiced ? 'Completed' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => toggleService(entry.id)}
                    className={`
                      px-3 py-1 rounded-md text-sm font-medium
                      ${entry.isServiced ?
                        'bg-gray-100 text-gray-600 hover:bg-gray-200' :
                        'bg-green-100 text-green-600 hover:bg-green-200'
                      }
                      transition-colors duration-200
                    `}
                  >
                    {entry.isServiced ? 'Undo' : 'Complete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 