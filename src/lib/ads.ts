/**
 * Google AdSense configuration.
 *
 * The publisher id is a public value (it also appears in /ads.txt and in the
 * rendered page source), so it is safe to ship a default here. Override it per
 * environment with NEXT_PUBLIC_ADSENSE_CLIENT if needed.
 */
export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-2980943706375055";

/** True when a real AdSense publisher id is configured (always true by default). */
export const ADS_ENABLED = /^ca-pub-\d{10,}$/.test(ADSENSE_CLIENT_ID);
