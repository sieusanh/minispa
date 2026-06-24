import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../supabase/server';
import { TABLE_NAMES } from '@/constants/config';
import { Material, GenericRecord } from '@/types';

export async function findMaterialById(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.MATERIALS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Material;
}

export async function findAllMaterials() {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.MATERIALS)
    .select('*');
  // .single();

  if (error) throw error;
  return data as Material[];
}

export async function insertMaterial(payload: Material) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.MATERIALS)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Material;
}

export async function updateMaterialById(
  id: string,
  obj: Partial<GenericRecord<Material>>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.MATERIALS)
    .update(obj)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Material;
}

export async function softDeleteMaterialById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE_NAMES.MATERIALS)
    .update({ isActive: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Material;
}

export async function hardDeleteMaterialById(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(TABLE_NAMES.MATERIALS)
    .delete()
    .eq('id', id);

  if (error) throw error;
}
