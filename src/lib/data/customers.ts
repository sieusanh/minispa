import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../supabase/server';
import { TABLE_NAMES } from '@/constants/config';
import { Customer, GenericRecord } from '@/types';
// import type { Customer } from '@/types'

export async function findCustomerById(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.CUSTOMERS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function findAllCustomers() {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.CUSTOMERS)
    .select('*');
  // .single();

  if (error) throw error;
  return data as Customer[];
}

export async function insertCustomer(payload: Customer) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.CUSTOMERS)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function updateCustomerById(
  id: string,
  obj: Partial<GenericRecord<Customer>>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.CUSTOMERS)
    .update(obj)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function softDeleteCustomerById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.CUSTOMERS)
    .update({ isActive: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function hardDeleteCustomerById(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(TABLE_NAMES.CUSTOMERS)
    .delete()
    .eq('id', id);

  if (error) throw error;
}
