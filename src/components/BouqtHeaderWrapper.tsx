import { createClient } from "@/lib/supabase/server";
import BouqtHeader from "@/components/ui/simple-header";

export default async function BouqtHeaderWrapper() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return <BouqtHeader userEmail={user?.email} isAdmin={isAdmin} />;
}
