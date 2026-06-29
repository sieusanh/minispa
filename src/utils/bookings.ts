import { type Booking, BookingStatus } from '@/types';
import { SERVICES } from '@/constants/config';
import { addMinutesToTime, getDateWithOffset } from '@/utils/time';

export function deriveStatus(
  booking: Partial<Booking>,
  now = new Date()
): BookingStatus {
  if (booking.status === BookingStatus.CANCELLED)
    return BookingStatus.CANCELLED;
  const start = new Date(`${booking.date}T${booking.startTime}`);
  const endTime = addMinutesToTime(
    booking.startTime!,
    SERVICES.find((s) => s.id === booking.serviceId)!.durationMin
  );
  const end = new Date(`${booking.date}T${endTime}`);
  const minsUntilStart = (start.getTime() - now.getTime()) / 1000 / 60;

  if (now >= end) return BookingStatus.DONE;
  if (now >= start) return BookingStatus.IN_PROGRESS;
  if (minsUntilStart <= 30) return BookingStatus.UPCOMING;
  return BookingStatus.OPEN;
}

export function transformBookingInput(
  payload: Partial<Booking>,
  offsetMins: number
) {
  payload.isActive = true;
  payload.date = getDateWithOffset(payload.date!, offsetMins);
  return payload;
}

export function transformBookingOutput(data: Partial<Booking>) {
  data.isActive = true;
  data.date = new Date(data.date!);
  return data;
}
