'use server';

import { SupabaseClient } from '@supabase/supabase-js';
import { cacheLife } from 'next/cache';
import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { TABLE_NAMES } from '@/constants/config';
import { Staff } from '@/types';
import { toSnake, toCamel } from '@/utils/common';
// import type { Staff } from '@/types'
// import { type Staff } from './modules';

export async function findStaffById(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.STAFF)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  // transmuting
  return toCamel<Staff>(data) as Partial<Staff>;
}

export async function findAllStaff() {
  //   'use cache';
  //   cacheLife({
  //     stale: 3600, // 1 hour until considered stale
  //     revalidate: 7200, // 2 hours until revalidated
  //     expire: 43200, // 12 hours until expired
  //   });
  const supabase: SupabaseClient = createAdminClient();
  const { data, error } = await supabase.from(TABLE_NAMES.STAFF).select('*');

  if (error) throw error;

  // transmuting
  const list: Array<Partial<Staff>> =
    data.map((d: Staff) => toCamel<Staff>(d) as Partial<Staff>) || [];

  return list;
}

export async function insertStaff(payload: Staff) {
  // transmuting
  const staff = toSnake(payload);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.STAFF)
    .insert(staff)
    .select()
    .single();

  if (error) throw error;

  // transmuting
  return toCamel<Staff>(data) as Partial<Staff>;
}

export async function upsertStaff(payload: Partial<Staff>) {
  // transmuting
  const staff = toSnake(payload);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.STAFF)
    .upsert(staff)
    .select()
    .single();

  if (error) throw error;

  // transmuting
  return toCamel<Staff>(data) as Partial<Staff>;
}

export async function updateStaffById(id: string, payload: Partial<Staff>) {
  // transmuting
  const staff = toSnake(payload);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.STAFF)
    .update(staff)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // transmuting
  return toCamel<Staff>(data) as Partial<Staff>;
}

export async function softDeleteStaffById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.STAFF)
    .update({ isActive: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // transmuting
  return toCamel<Staff>(data) as Partial<Staff>;
}

export async function hardDeleteStaffById(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(TABLE_NAMES.STAFF)
    .delete()
    .eq('id', id);

  if (error) throw error;
}
