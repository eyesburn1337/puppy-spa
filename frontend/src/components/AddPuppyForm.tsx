'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { generateTimeSlots, formatTimeSlot, isTimeSlotAvailable } from '@/utils/time-slots';
import type { WaitingListEntry } from '@/types';

interface Props {
  onSubmit: (data: any) => void;
  waitingList: WaitingListEntry[];
  selectedDate: string;
}

export default function AddPuppyForm({ onSubmit, waitingList, selectedDate }: Props) {
  const [formData, setFormData] = useState({
    petName: '',
    customerName: '',
    service: 'Grooming',
    time: '09:00'
  });

  const timeSlots = generateTimeSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create date from selected date and time with timezone handling
    const [hours, minutes] = formData.time.split(':');
    
    // Create date in local timezone
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // Convert to UTC for backend
    const utcDate = new Date(Date.UTC(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate(),
      appointmentDate.getHours(),
      appointmentDate.getMinutes(),
      0,
      0
    ));

    onSubmit({
      ...formData,
      createdAt: utcDate.toISOString()
    });

    // Reset form
    setFormData({
      petName: '',
      customerName: '',
      service: 'Grooming',
      time: '09:00'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pet Name
          </label>
          <input
            type="text"
            value={formData.petName}
            onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm
                     text-sm text-gray-900 placeholder-gray-400
                     focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                     disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Enter pet name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner Name
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm
                     text-sm text-gray-900 placeholder-gray-400
                     focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                     disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Enter owner name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service
          </label>
          <select
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm
                     text-sm text-gray-900
                     focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                     cursor-pointer appearance-none
                     bg-no-repeat bg-right
                     bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNyA3TDEwIDEwTDEzIDciIHN0cm9rZT0iIzZCN0NCNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')]"
          >
            <option value="Grooming">Grooming</option>
            <option value="Bathing">Bathing</option>
            <option value="Nail Trimming">Nail Trimming</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <select
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm
                     text-sm text-gray-900
                     focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                     cursor-pointer appearance-none
                     bg-no-repeat bg-right
                     bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNyA3TDEwIDEwTDEzIDciIHN0cm9rZT0iIzZCN0NCNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')]
                     disabled:bg-gray-50 disabled:text-gray-500"
          >
            {timeSlots.map(slot => (
              <option 
                key={slot} 
                value={slot}
                disabled={!isTimeSlotAvailable(slot, waitingList)}
                className="py-1"
              >
                {formatTimeSlot(slot)}
                {!isTimeSlotAvailable(slot, waitingList) && ' (Booked)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium text-white
                   bg-gradient-to-r from-indigo-600 to-purple-600
                   rounded-lg shadow-sm
                   hover:from-indigo-700 hover:to-purple-700
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                   transition-colors duration-200"
        >
          Add Appointment
        </button>
      </div>
    </form>
  );
}