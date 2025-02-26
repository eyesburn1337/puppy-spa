'use client';

import { useEffect, useState } from 'react';
import { WaitingListEntry } from '@/types';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';
import { format, parseISO } from 'date-fns';
import { generateTimeSlots, formatTimeSlot, isTimeSlotAvailable } from '@/utils/time-slots';
import { ServiceStatus } from '@/types';

interface Props {
  entries: WaitingListEntry[];
  onUpdate: () => void;
  selectedDate: string;
}

interface EditingState {
  id: string;
  petName: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: ServiceStatus;
}

const getStatusColor = (status: ServiceStatus) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default: // Pending
      return 'bg-yellow-100 text-yellow-800';
  }
};

export default function WaitingListTable({ entries, onUpdate, selectedDate }: Props) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [mounted, setMounted] = useState(false);
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    setMounted(true);
  }, []);

  const startEditing = (entry: WaitingListEntry) => {
    const entryDate = new Date(entry.appointmentTime);
    setEditing({
      id: entry.id,
      petName: entry.petName,
      customerName: entry.customerName,
      service: entry.service,
      date: format(entryDate, 'yyyy-MM-dd'),
      time: format(entryDate, 'HH:mm'),
      status: entry.status
    });
  };

  const handleSave = async (id: string) => {
    if (!editing) return;

    try {
      const appointmentDate = new Date(editing.date);
      const [hours, minutes] = editing.time.split(':');
      appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      const response = await fetch(`http://localhost:3001/api/waiting-list/by-date/${selectedDate}/${id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          petName: editing.petName,
          customerName: editing.customerName,
          service: editing.service,
          appointmentTime: appointmentDate.toISOString(),
          status: editing.status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      setEditing(null);
      onUpdate();
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    
    try {
      const response = await fetch(`http://localhost:3001/api/waiting-list/by-date/${selectedDate}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          entryId: draggableId,
          newIndex: destination.index
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reorder list');
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to reorder:', error);
    }
  };

  const markAsServiced = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/waiting-list/by-date/${selectedDate}/${id}/service`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update service status');
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to mark as serviced:', error);
    }
  };

  const updateStatus = async (id: string, newStatus: ServiceStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/waiting-list/by-date/${selectedDate}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const renderCell = (entry: WaitingListEntry, field: keyof WaitingListEntry) => {
    const isEditing = editing?.id === entry.id;

    if (!isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {field === 'appointmentTime' ? (
            <span>{format(parseISO(entry.appointmentTime), 'MMM d, h:mm a')}</span>
          ) : field === 'service' ? (
            <span className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
              ${entry.service === 'Grooming' ? 'bg-purple-100 text-purple-800' :
                entry.service === 'Bathing' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }
            `}>
              {entry[field]}
            </span>
          ) : field === 'status' ? (
            <span className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
              ${getStatusColor(entry.status)}
            `}>
              {entry.status}
            </span>
          ) : (
            <span>{entry[field]}</span>
          )}
        </div>
      );
    }

    switch (field) {
      case 'petName':
      case 'customerName':
        return (
          <input
            type="text"
            value={editing[field]}
            onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
          />
        );
      case 'service':
        return (
          <select
            value={editing.service}
            onChange={(e) => setEditing({ ...editing, service: e.target.value })}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="Grooming">Grooming</option>
            <option value="Bathing">Bathing</option>
            <option value="Nail Trimming">Nail Trimming</option>
          </select>
        );
      case 'appointmentTime':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={editing.date}
              onChange={(e) => setEditing({ ...editing, date: e.target.value })}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={editing.time}
              onChange={(e) => setEditing({ ...editing, time: e.target.value })}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {timeSlots.map(slot => (
                <option 
                  key={slot} 
                  value={slot}
                  disabled={!isTimeSlotAvailable(slot, entries.filter(e => e.id !== entry.id))}
                >
                  {formatTimeSlot(slot)}
                  {!isTimeSlotAvailable(slot, entries.filter(e => e.id !== entry.id)) && ' (Booked)'}
                </option>
              ))}
            </select>
          </div>
        );
      case 'status':
        return (
          <select
            value={editing.status}
            onChange={(e) => setEditing({ ...editing, status: e.target.value as ServiceStatus })}
            className={`
              block w-full px-3 py-1 text-xs font-medium border-0 rounded-full
              focus:ring-2 focus:ring-indigo-500 focus:outline-none
              cursor-pointer transition-colors duration-200
              ${getStatusColor(editing.status)}
            `}
          >
            <option value="Pending" className="bg-yellow-50 text-yellow-800">Pending</option>
            <option value="Completed" className="bg-green-50 text-green-800">Completed</option>
            <option value="Cancelled" className="bg-red-50 text-red-800">Cancelled</option>
          </select>
        );
      default:
        return null;
    }
  };

  const renderStatusCell = (entry: WaitingListEntry) => {
    const isEditing = editing?.id === entry.id;

    if (!isEditing) {
      return (
        <div className="flex items-center">
          <span className={`
            inline-flex items-center px-3 py-1.5 
            rounded-md text-sm font-medium border
            transition-colors duration-200
            ${getStatusColor(entry.status)}
          `}>
            {entry.status}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <select
          value={entry.status}
          onChange={(e) => updateStatus(entry.id, e.target.value as ServiceStatus)}
          className={`
            block w-full px-3 py-1.5 text-sm
            border rounded-md shadow-sm
            focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            cursor-pointer transition-colors duration-200
            ${getStatusColor(entry.status)}
          `}
        >
          <option value="Pending" className="bg-yellow-50 text-yellow-800">Pending</option>
          <option value="Completed" className="bg-green-50 text-green-800">Completed</option>
          <option value="Cancelled" className="bg-red-50 text-red-800">Cancelled</option>
        </select>
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500">Loading table...</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 text-center">
                #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pet Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appointment Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Actions
              </th>
            </tr>
          </thead>
          <StrictModeDroppable droppableId="waiting-list">
            {(provided) => (
              <tbody
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="bg-white divide-y divide-gray-200"
              >
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-xl font-medium mb-2">No appointments yet</p>
                        <p className="text-sm text-gray-400">Add your first appointment using the form</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, index) => {
                    const isEditing = editing?.id === entry.id;
                    
                    return (
                      <Draggable 
                        key={entry.id} 
                        draggableId={entry.id} 
                        index={index}
                        isDragDisabled={isEditing || entry.status !== 'Pending'}
                      >
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              group transition-all duration-200
                              ${entry.status === 'Completed' ? 'bg-green-50' :
                                entry.status === 'Cancelled' ? 'bg-red-50' :
                                'hover:bg-gray-50'
                              }
                              ${snapshot.isDragging ? 'shadow-lg bg-indigo-50' : ''}
                            `}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                <span className={`
                                  w-8 h-8 flex items-center justify-center rounded-full font-medium
                                  ${entry.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                    entry.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                    snapshot.isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                                  }
                                  ${!entry.isServiced && 'cursor-move hover:bg-gray-200'}
                                `}>
                                  {index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {renderCell(entry, 'petName')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {renderCell(entry, 'customerName')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {renderCell(entry, 'service')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {renderCell(entry, 'appointmentTime')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? renderStatusCell(entry) : renderCell(entry, 'status')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleSave(entry.id)}
                                    className="px-2 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditing(null)}
                                    className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEditing(entry)}
                                  className="invisible group-hover:visible p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    );
                  })
                )}
                {provided.placeholder}
              </tbody>
            )}
          </StrictModeDroppable>
        </table>
      </div>
    </DragDropContext>
  );
} 