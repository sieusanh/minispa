import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { type Booking, BookingStatus } from '@/types';
import { SERVICES } from '@/constants/config';
import { CACHE_TAG } from '@/constants/cache';
import { addMinutesToTime, getDateWithOffset } from '@/utils/time';
import { createClient } from '@/lib/supabase/client';
import { toCamel } from './common';

export function deriveStatus(
  booking: Partial<Booking>,
  now = new Date()
): BookingStatus {
  if (booking.status === BookingStatus.CANCELLED)
    return BookingStatus.CANCELLED;

  const bookingDate = new Date(booking.date!).toLocaleDateString('en-CA');
  const start = new Date(`${bookingDate}T${booking.startTime}`);
  const endTime = addMinutesToTime(
    booking.startTime!,
    SERVICES.find((s) => s.id === booking.serviceId)!.durationMin
  );
  const end = new Date(`${bookingDate}T${endTime}`);
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

  //   payload.status = deriveStatus(payload);
  payload.date = getDateWithOffset(payload.date!, offsetMins);
  return payload;
}

export function transformBookingOutput(data: Partial<Booking>) {
  data.isActive = true;
  data.date = new Date(data.date!);
  return data;
}

export const bookingDateTag = (date: Date) =>
  `${CACHE_TAG.BOOKINGS_BY_DATE}-${date.toLocaleDateString('en-CA')}`;

export function runRealtimeBookings(
  date: Date, // re-subscribes on date change
  onInsert: (booking: Partial<Booking>) => void,
  onUpdate: (booking: Partial<Booking>) => void,
  onDelete: (id: string) => void
) {
  const supabase: SupabaseClient = createClient();
  //   const supabase: SupabaseClient = createAdminClient();
  const bookingDate = date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
  const channel: RealtimeChannel = supabase
    .channel(`bookings-${bookingDate}`) // unique channel per date
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'bookings',
        filter: `date=eq.${bookingDate}`, // only this date's rows
      },
      (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        console.log('======= eventType ', eventType);
        console.log('======= newRow ', newRow);

        if (eventType === 'INSERT') {
          const booking = transformBookingOutput(
            toCamel<Booking>(newRow as Booking)
          );
          onInsert({
            ...booking,
            status: deriveStatus(booking, new Date()), // derive on arrival
          });
        }

        if (eventType === 'UPDATE') {
          const booking = transformBookingOutput(
            toCamel<Booking>(newRow as Booking)
          );
          onUpdate({
            ...booking,
            status: deriveStatus(booking, new Date()),
          });
        }

        if (eventType === 'DELETE') {
          onDelete(oldRow.id as string);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] subscribed to bookings-${bookingDate}`);
      }
    });

  return { supabase, channel };
}
