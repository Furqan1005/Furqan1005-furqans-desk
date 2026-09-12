import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const fullName =
    (user.user_metadata?.full_name as string | undefined)?.trim() || user.email || "You";

  return { id: user.id, email: user.email ?? "", fullName };
}
