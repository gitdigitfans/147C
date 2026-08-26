"use client";

import { useEffect } from "react";

// Saves the current products list URL (with its q/category/page filters) so
// ProductForm can redirect back here after a save instead of always landing
// on the unfiltered /admin/products list.
export default function RememberListUrl() {
  useEffect(() => {
    sessionStorage.setItem("admin_products_list_url", window.location.pathname + window.location.search);
  }, []);

  return null;
}
