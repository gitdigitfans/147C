// Rewrites a Cloudinary delivery URL to add on-the-fly resize/compression
// transformations, so the browser downloads an image sized for where it's
// actually displayed instead of the original upload (which can be several
// MB). Next's own image optimizer is disabled here (images.unoptimized in
// next.config.js - it doesn't run on the Cloudflare Workers runtime), so
// Cloudinary's URL-based transformations replace that job.
//
// Non-Cloudinary URLs (picsum.photos fallback, external product images) are
// returned unchanged.
export function cldUrl(url: string | undefined | null, width: number): string {
  if (!url) return url || "";
  const marker = "/image/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url;

  const transform = `w_${width},c_limit,q_auto,f_auto,dpr_auto`;
  return url.slice(0, i + marker.length) + transform + "/" + url.slice(i + marker.length);
}
