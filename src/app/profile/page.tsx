import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#fde8ec] flex items-center justify-center">
          <User className="w-6 h-6 text-[#E8748A]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-800">My profile</h1>
          <p className="text-stone-400 text-sm">{user.email}</p>
        </div>
      </div>

      {params.saved && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          Profile saved!
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <form action={updateProfile} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Display name</Label>
            <Input
              id="display_name"
              name="display_name"
              placeholder="e.g. Maria Santos"
              defaultValue={profile?.display_name ?? ""}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user.email ?? ""} readOnly className="bg-stone-50 text-stone-400 cursor-not-allowed" />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="saved_address">Saved delivery address</Label>
            <Input
              id="saved_address"
              name="saved_address"
              placeholder="123 Jasmine St, your city"
              defaultValue={profile?.saved_address ?? ""}
            />
            <p className="text-xs text-stone-400">
              This address auto-fills when you choose delivery at checkout.
            </p>
          </div>

          <Button type="submit" className="bg-[#E8748A] hover:bg-[#d4607a] text-white w-full">
            Save profile
          </Button>
        </form>
      </div>
    </div>
  );
}
