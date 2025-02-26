'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { config } from '@/config/environment';

interface HistoryEntry {
  id: string;
  date: string;
  totalPuppies: number;
  servicedPuppies: number;
  revenue: number;
  puppies: Array<{
    petName: string;
    customerName: string;
    service: string;
    isServiced: boolean;
    appointmentTime: string;
  }>;
}

export default function HistoricalLists() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days

      const response = await fetch(
        `${config.apiUrl}/waiting-list/history?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      
      // Group by date and remove duplicates
      const uniqueEntries = data.entries.reduce((acc: HistoryEntry[], curr: HistoryEntry) => {
        const dateKey = format(new Date(curr.date), 'yyyy-MM-dd');
        const existingIndex = acc.findIndex(entry => 
          format(new Date(entry.date), 'yyyy-MM-dd') === dateKey
        );
        
        if (existingIndex === -1) {
          acc.push(curr);
        }
        return acc;
      }, []);

      setHistory(uniqueEntries);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No historical data available</p>
          </div>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {format(new Date(entry.date), 'MMMM d, yyyy')}
                  </h3>
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>Total: {entry.totalPuppies}</span>
                    <span>Completed: {entry.servicedPuppies}</span>
                    <span className="font-medium">Revenue: ${entry.revenue}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="divide-y divide-gray-200">
                  {entry.puppies.map((puppy, index) => (
                    <div key={index} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{puppy.petName}</p>
                        <p className="text-sm text-gray-600">{puppy.customerName}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {format(new Date(puppy.appointmentTime), 'h:mm a')}
                        </span>
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${puppy.service === 'Grooming' ? 'bg-purple-100 text-purple-800' :
                            puppy.service === 'Bathing' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        `}>
                          {puppy.service}
                        </span>
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${puppy.isServiced ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {puppy.isServiced ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 