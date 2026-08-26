import type { SyntheticEvent } from "react";

const FALLBACK_URL = "https://picsum.photos/seed/fallback/600/450";

export function onImgError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fbApplied) return;
  img.dataset.fbApplied = "1";
  img.onerror = null;
  img.src = FALLBACK_URL;
}
