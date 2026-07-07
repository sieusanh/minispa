'use server';
import { cacheLife, cacheTag, updateTag, revalidateTag } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { TABLE_NAMES } from '@/constants/config';
import { CACHE_TAG } from '@/constants/cache';
import { Booking, BookingStatus, FindParams } from '@/types';
import { toSnake, toCamel, transformDataInput } from '@/utils/common';
import {
  transformBookingInput,
  transformBookingOutput,
  bookingDateTag,
} from '@/utils/bookings';

export async function findBookingById(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  // transmuting
  const res = transformBookingOutput(toCamel<Booking>(data));
  return res;
}

export async function findBookingsByDate(date: Date) {
  'use cache';
  //   cacheLife('hours');
  //   cacheLife({
  //     stale: 3600, // 1 hour until considered stale
  //     revalidate: 7200, // 2 hours until revalidated
  //     expire: 43200, // 12 hours until expired
  //   });
  cacheLife({
    stale: 60,
    revalidate: 120, // 2 hours until revalidated
    expire: 3600, // 12 hours until expired
  });
  cacheTag(bookingDateTag(date));
  const bookingDate = date.toLocaleDateString('en-CA');

  const supabase: SupabaseClient = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .select('*')
    .eq('date', bookingDate)
    .eq('is_active', true);
  //   .single();

  if (error) throw error;

  // transmuting
  const list: Array<Partial<Booking>> =
    data.map((d: Partial<Booking>) =>
      transformBookingOutput(toCamel<Booking>(d))
    ) || [];

  return list;
}

export async function findAllBookings(params: Partial<FindParams>) {
  const { select, where, limit } = params;
  // 1. Establish the boundary times for the current day
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Midnight this morning

  const todayEnd = new Date();
  todayEnd.setHours(23, 55, 59, 999); // Final millisecond of the day
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase.from(TABLE_NAMES.BOOKINGS).select('*');
  // .single();

  if (error) throw error;

  // transmuting
  const list: Array<Partial<Booking>> =
    data.map((d: Partial<Booking>) =>
      transformBookingOutput(toCamel<Booking>(d))
    ) || [];

  return list;
}

export async function insertBooking(payload: Booking) {
  // transmuting
  const booking = toSnake(transformDataInput(payload));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .insert(booking)
    .select()
    .single();

  if (error) throw error;

  // transmuting
  return transformBookingOutput(toCamel<Booking>(data));
}

export async function upsertBooking(
  payload: Partial<Booking>,
  tzOffsetMins: number
) {
  // transmuting
  const booking = toSnake(transformBookingInput(payload, tzOffsetMins));

  //   const supabase = await createClient();
  const supabase: SupabaseClient = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .upsert(booking)
    .select()
    .single();
  console.log('=========== db error ', error);
  if (error) throw error;

  //   updateTag(CACHE_TAG.BOOKINGS_BY_DATE);
  revalidateTag(bookingDateTag(new Date(payload.date!)), 'minutes');

  // transmuting
  //   return transformBookingOutput(toCamel<Booking>(data));
  return transformBookingOutput(toCamel<Booking>(data));
}

export async function bulkUpdateBooking(payload: Partial<Booking>[]) {
  // transmuting

  const list: Array<Partial<Booking>> =
    payload.map((d: Partial<Booking>) => toSnake<Partial<Booking>>(d)) || [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .upsert(list)
    .select();

  if (error) throw error;

  updateTag(CACHE_TAG.BOOKINGS_BY_DATE);

  // transmuting
  const res: Partial<Booking>[] =
    data.map((d: Partial<Booking>) =>
      transformBookingOutput(toCamel<Booking>(d))
    ) || [];

  return res;
}

export async function updateBookingById(id: string, payload: Partial<Booking>) {
  // transmuting
  const booking = toSnake(payload);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .update(booking)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  updateTag(CACHE_TAG.BOOKINGS_BY_DATE);

  // transmuting
  return toCamel<Booking>(data) as Partial<Booking>;
}

export async function softDeleteBookingById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .update({ is_active: false, status: BookingStatus.CANCELLED })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  updateTag(CACHE_TAG.BOOKINGS_BY_DATE);

  // transmuting
  return toCamel<Booking>(data) as Partial<Booking>;
}

export async function hardDeleteBookingById(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .delete()
    .eq('id', id);

  if (error) throw error;
}
