import { useState } from 'react';
import type { WaitingListEntry } from '@/types';
import { generateTimeSlots, formatTimeSlot, isTimeSlotAvailable } from '@/utils/time-slots';

interface Props {
  selectedDate: string;
  existingAppointments: WaitingListEntry[];
  onSubmit: (data: any) => void;
}

export default function AppointmentForm({ selectedDate, existingAppointments, onSubmit }: Props) {
  const [selectedTime, setSelectedTime] = useState('');
  const [petName, setPetName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [service, setService] = useState('');

  const timeSlots = generateTimeSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const appointmentDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    onSubmit({
      petName,
      customerName,
      service,
      createdAt: appointmentDate.toISOString()
    });

    // Reset form
    setSelectedTime('');
    setPetName('');
    setCustomerName('');
    setService('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Time Slot</label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a time</option>
          {timeSlots.map(slot => (
            <option 
              key={slot} 
              value={slot}
              disabled={!isTimeSlotAvailable(slot, existingAppointments)}
            >
              {formatTimeSlot(slot)}
              {!isTimeSlotAvailable(slot, existingAppointments) && ' (Booked)'}
            </option>
          ))}
        </select>
      </div>

      {/* Rest of your form fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Pet Name</label>
        <input
          type="text"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Owner Name</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Service</label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a service</option>
          <option value="Grooming">Grooming</option>
          <option value="Bathing">Bathing</option>
          <option value="Nail Trimming">Nail Trimming</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Appointment
      </button>
    </form>
  );
} 