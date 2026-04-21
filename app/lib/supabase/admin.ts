import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Loose generic so .from(...).insert(...) doesn't type-error without a
// generated Database typing. All row shapes are enforced at read time via
// `as unknown as RowType` assertions in callers.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = SupabaseClient<any, "public", "public", any, any>;

let cached: Loose | null = null;

export function createSupabaseAdminClient(): Loose {
  if (cached) return cached;
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  ) as Loose;
  return cached;
}
