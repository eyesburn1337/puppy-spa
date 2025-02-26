import type { WaitingListEntry } from '@/types';

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const startHour = 9;  // 9:00 AM
  const endHour = 17;   // 5:00 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    // Add both :00 and :30 slots
    slots.push(
      `${hour.toString().padStart(2, '0')}:00`,
      `${hour.toString().padStart(2, '0')}:30`
    );
  }
  // Add the last slot at 17:00
  slots.push('17:00');
  
  return slots;
}

export function formatTimeSlot(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function isTimeSlotAvailable(slot: string, existingAppointments: WaitingListEntry[] = []) {
  if (!existingAppointments || existingAppointments.length === 0) return true;

  const [hours, minutes] = slot.split(':');
  
  return !existingAppointments.some(appointment => {
    const appointmentTime = new Date(appointment.appointmentTime);
    const localHours = appointmentTime.getHours();
    const localMinutes = appointmentTime.getMinutes();
    
    return localHours === parseInt(hours, 10) && 
           localMinutes === parseInt(minutes, 10) &&
           appointment.status !== 'Cancelled';
  });
} 