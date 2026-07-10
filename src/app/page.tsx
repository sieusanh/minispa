// /src/app/page.tsx
import { redirect } from 'next/navigation';
// import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function RootPage() {
  const cookieStore = await cookies();
  //   const supabase = createServerClient();
  //   const {
  //     data: { session },
  //   } = await supabase.auth.getSession();

  //   if (!session) {
  //     redirect('/login');
  //   }

  //   const { data: profile } = await supabase
  //     .from('staff')
  //     .select('role')
  //     .eq('id', session.user.id)
  //     .single();

  //   if (profile?.role === 'admin') {
  //     redirect('/bookings'); // → (admin) route group
  //   }

  //   if (profile?.role === 'technician') {
  //     redirect('/revenue'); // → (technician) route group, or /bookings
  //   }

  // Protect page at server level
  if (!cookieStore.has('access_token')) {
    redirect('/login');
  }

  // No valid role found — fail safe
  redirect('/bookings');
}
