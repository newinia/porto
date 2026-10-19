
"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const { error } = await supabaseBrowser.auth.signOut();

    if (error) {
      alert("Gagal logout. Coba lagi.");
      return;
    }

    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="admin-logout"
      onClick={handleLogout}
    >
      Logout ↗
    </button>
  );
}
