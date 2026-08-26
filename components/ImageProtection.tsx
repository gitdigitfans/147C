"use client";

import { useEffect } from "react";

// Lightweight, site-wide deterrents against casually saving product photos:
// blocks the right-click "Save image as..." menu and drag-to-save on <img>
// elements, on top of the CSS in globals.css that disables the long-press
// "save image" callout on mobile and image drag ghosting.
//
// Honest caveat: none of this can make an image technically undownloadable -
// anyone can still get it via browser devtools, a screenshot, or view-source.
// This only removes the *easy, obvious* ways (right-click, drag, long-press).
export default function ImageProtection() {
  useEffect(() => {
    function blockImageContextMenu(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "IMG") {
        e.preventDefault();
      }
    }

    function blockImageDrag(e: DragEvent) {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "IMG") {
        e.preventDefault();
      }
    }

    document.addEventListener("contextmenu", blockImageContextMenu);
    document.addEventListener("dragstart", blockImageDrag);

    return () => {
      document.removeEventListener("contextmenu", blockImageContextMenu);
      document.removeEventListener("dragstart", blockImageDrag);
    };
  }, []);

  return null;
}
