'use client';

import { useState, useEffect } from 'react';
import { WaitingListEntry } from '@/types';
import debounce from 'lodash/debounce';
import { format } from 'date-fns';
import { config } from '@/config/environment';

interface SearchResult extends WaitingListEntry {
  visitDate: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

export default function SearchHistory() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchPuppies = debounce(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(
        `${config.apiUrl}/waiting-list/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data.entries);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    searchPuppies(query);
  }, [query]);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Search History</h2>
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by puppy name or owner..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {loading && (
              <div className="absolute right-3 top-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              </div>
            )}
          </div>
        </div>

        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left">Visit Date</th>
                  <th className="px-6 py-3 text-left">Pet Name</th>
                  <th className="px-6 py-3 text-left">Owner</th>
                  <th className="px-6 py-3 text-left">Service</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Appointment Time</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={`${result.id}-${result.visitDate}`} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{result.visitDate}</td>
                    <td className="px-6 py-4">{result.petName}</td>
                    <td className="px-6 py-4">{result.customerName}</td>
                    <td className="px-6 py-4">{result.service}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(result.appointmentTime), 'MMM d, h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : query.length > 0 && !loading ? (
          <div className="text-center text-gray-500 py-4">
            No results found
          </div>
        ) : null}
      </div>
    </div>
  );
} 