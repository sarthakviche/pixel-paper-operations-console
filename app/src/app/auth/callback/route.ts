import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback handler for Supabase OAuth/magic link flows.
 * Not used in MVP (email/password only), but included as a safety net.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirect(`${origin}${next}`);
    }
  }

  return redirect(`${origin}/login?error=auth_callback_failed`);
}
