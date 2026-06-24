'use server';

import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../supabase/server';
import { TABLE_NAMES } from '@/constants/config';
import { Booking, FindParams } from '@/types';
import { toSnake, toCamel } from '@/utils/common';

export async function findBookingById(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  // transmuting
  return toCamel<Booking>(data) as Partial<Booking>;
}

export async function findTodayBookings(params?: FindParams) {
  // 1. Establish the boundary times for the current day
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Midnight this morning

  const todayEnd = new Date();
  todayEnd.setHours(23, 55, 59, 999); // Final millisecond of the day

  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .select('*')
    .gte('date', todayStart.toISOString())
    .lte('date', todayEnd.toISOString());
  //   .single();

  if (error) throw error;

  // transmuting
  const list: Array<Partial<Booking>> =
    data.map((d: Booking) => toCamel<Booking>(d) as Partial<Booking>) || [];

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
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .select('*')
    .gte('date', todayStart.toISOString())
    .lte('date', todayEnd.toISOString());
  // .single();

  if (error) throw error;

  // transmuting
  const list: Array<Partial<Booking>> = data.map(
    (d: Booking) => toCamel<Booking>(d) as Partial<Booking>
  );

  return list;
}

export async function insertBooking(payload: Booking) {
  // transmuting
  const booking = toSnake(payload);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .insert(booking)
    .select()
    .single();

  if (error) throw error;

  // transmuting
  return toCamel<Booking>(data) as Partial<Booking>;
}

export async function upsertBooking(payload: Partial<Booking>) {
  // transmuting
  const booking = toSnake(payload);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .upsert(booking)
    .select()
    .single();

  if (error) throw error;

  // transmuting
  return toCamel<Booking>(data) as Partial<Booking>;
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

  // transmuting
  return toCamel<Booking>(data) as Partial<Booking>;
}

export async function softDeleteBookingById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.BOOKINGS)
    .update({ isActive: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

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
