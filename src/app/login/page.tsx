import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BouqtSignIn from "@/components/ui/signup-1";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/bouquets");

  return <BouqtSignIn />;
}
