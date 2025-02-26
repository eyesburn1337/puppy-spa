'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { config } from '@/config/environment';
import WaitingListTable from '@/components/WaitingListTable';
import AddPuppyForm from '@/components/AddPuppyForm';
import { WaitingListEntry } from '@/types';
import HistoricalLists from '@/components/HistoricalLists';
import SearchHistory from '@/components/SearchHistory';
import Tabs from '@/components/Tabs';
import DashboardStats from '@/components/DashboardStats';

export default function Home() {
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [dayListId, setDayListId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    initializeDayList();
  }, [selectedDate]);

  const initializeDayList = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${config.apiUrl}/waiting-list/by-date/${selectedDate}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWaitingList(data.entries || []);
      setDayListId(data.dayListId || '');
      
    } catch (error) {
      console.error('Failed to fetch list:', error);
      setError('Failed to load waiting list');
      setWaitingList([]);
      setDayListId('');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPuppy = async (data: any) => {
    try {
      const response = await fetch(`${config.apiUrl}/waiting-list/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to add appointment');
      }

      // Refresh the waiting list
      await initializeDayList();
    } catch (error) {
      console.error('Failed to add puppy:', error);
      setError('Failed to add appointment');
    }
  };

  const tabs = [
    {
      id: 'today',
      label: format(new Date(selectedDate), 'EEEE, MMMM d, yyyy'),
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      content: (
        <div className="space-y-8">
          <DashboardStats 
            waitingList={waitingList} 
            selectedDate={selectedDate}
          />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300">
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <AddPuppyForm 
                  onSubmit={handleAddPuppy} 
                  selectedDate={selectedDate}
                  waitingList={waitingList}
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300">
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <div className="p-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                      <p className="mt-4 text-gray-500">Loading appointments...</p>
                    </div>
                  ) : (
                    <WaitingListTable 
                      entries={waitingList} 
                      onUpdate={initializeDayList}
                      selectedDate={selectedDate}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'search',
      label: 'Search Records',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      content: (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <SearchHistory />
        </div>
      ),
    },
    {
      id: 'history',
      label: 'Historical Lists',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <HistoricalLists />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 flex items-center space-x-4">
                <div className="relative h-14 w-14 transform hover:scale-110 transition-transform duration-200">
                  <Image
                    src="/images/puppy-logo.svg"
                    alt="Puppy Spa Logo"
                    fill
                    className="rounded-full object-cover"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Puppy Spa
                  </h1>
                  <p className="text-sm text-gray-500">Grooming & Care Services</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 py-1 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <Tabs tabs={tabs} />
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Puppy Spa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 