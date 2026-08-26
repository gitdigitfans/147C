"use client";

import { useEffect, useState } from "react";
import ShowroomPreloader from "@/components/ShowroomPreloader";

const STORAGE_KEY = "pharaoh_showroom_seen";

export default function ShowroomPreloaderGate() {
  const [mounted, setMounted] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setShouldShow(true);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }
    } catch {
      // sessionStorage unavailable (e.g. privacy mode) - just skip the preloader
    }
    setMounted(true);
  }, []);

  if (!mounted || !shouldShow) return null;

  return <ShowroomPreloader onFinished={() => setShouldShow(false)} />;
}
