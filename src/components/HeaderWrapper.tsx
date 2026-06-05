import { createClient } from "@/lib/supabase/server";
import Header from "./Header";

export default async function HeaderWrapper() {
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

  return <Header userEmail={user?.email} isAdmin={isAdmin} />;
}
