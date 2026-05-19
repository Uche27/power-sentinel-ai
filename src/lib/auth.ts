// Legacy helper kept for backward compat — auth now goes through Supabase.
// Use the useCurrentUser hook instead.
import { supabase } from "@/integrations/supabase/client";

export async function signOut() {
  await supabase.auth.signOut();
}
