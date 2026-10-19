
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    async function recordVisit() {
      try {
        let visitorId = localStorage.getItem("newi_visitor_id");

        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem("newi_visitor_id", visitorId);
        }

        const { error } = await supabaseBrowser
          .from("website_visits")
          .insert({
            visitor_id: visitorId,
            page: pathname,
          });

        if (error) {
          console.error("Gagal mencatat kunjungan:", error.message);
        }
      } catch (error) {
        console.error("Tracking error:", error);
      }
    }

    recordVisit();
  }, [pathname]);

  return null;
}
