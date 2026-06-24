// import { SupabaseClient } from '@supabase/supabase-js';
// import { createClient } from '../supabase/server';
// import { IBase, GenericRecord } from '@/types';

// export class GenericModel<T extends IBase> {
//   protected table: string;
//   protected supabase: Promise<SupabaseClient>;

//   constructor(table: string) {
//     this.table = table;
//     this.supabase = createClient();
//   }

//   async findAll() {
//     const supabase = await createClient();
//     const { data } = await supabase.from('staff').select();
//     return data as T;
//   }

//   async findById() {
//     const supabase = await createClient();
//     const { data } = await supabase.from('staff').select();
//     return data;
//   }

//   async insert(payload: IBase) {
//     const supabase = await createClient();
//     const { data } = await supabase.from('staff').insert(payload);
//     return data;
//   }

//   // k: K, v: BookingDraft[K]
//   // Partial<Record<keyof Booking, string>>

//   async updateById(id: string, obj: Partial<GenericRecord<T>>) {
//     const supabase = await createClient();
//     const { data } = await supabase.from('staff').update(obj).eq('id', id);
//     return data;
//   }

//   async softDeleteById(id: string) {
//     const supabase = await createClient();
//     await supabase.from('staff').update({ isActive: true }).eq('id', id);
//   }
// }
