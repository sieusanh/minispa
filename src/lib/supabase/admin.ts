// /src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

// Synchronous — no cookies, no dynamic APIs, cache-compatible
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
