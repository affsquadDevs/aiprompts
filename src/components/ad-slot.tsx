"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT_ID, ADS_ENABLED } from "@/lib/ads";

/**
 * Ad placement slot.
 *
 * The whole site is free and ad-supported.
 *  - With a publisher id configured (default) AND a `slotId` passed, a real
 *    Google AdSense unit renders, labelled "Advertisement".
 *  - With a publisher id but NO `slotId`, the slot renders nothing so Google
 *    Auto ads (enabled in the AdSense console) can control placement instead.
 *  - With no publisher id at all (e.g. local dev), a clearly-labelled
 *    placeholder is shown so you can see where ads will appear.
 *
 * Per-placement slot ids come from NEXT_PUBLIC_AD_SLOT_* env vars.
 */

type AdFormat = "leaderboard" | "rectangle" | "inline" | "sidebar";

const SIZES: Record<AdFormat, string> = {
  leaderboard: "min-h-[90px] w-full",
  rectangle: "min-h-[250px] w-full max-w-[336px] mx-auto",
  inline: "min-h-[120px] w-full",
  sidebar: "min-h-[600px] w-full",
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  format = "leaderboard",
  slotId,
  label = "Advertisement",
  className = "",
}: {
  format?: AdFormat;
  slotId?: string;
  label?: string;
  className?: string;
}) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADS_ENABLED || !slotId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* ad blocker or not ready — ignore */
    }
  }, [slotId]);

  // Real AdSense unit (publisher id + explicit slot id).
  if (ADS_ENABLED && slotId) {
    return (
      <div className={`mx-auto w-full ${className}`}>
        <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
          {label}
        </p>
        <div className={`overflow-hidden ${SIZES[format]}`}>
          <ins
            className="adsbygoogle block"
            style={{ display: "block" }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // Publisher id present but no slot id → let Auto ads place ads; render nothing.
  if (ADS_ENABLED) return null;

  // No publisher id (local dev) → labelled placeholder.
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-dashed border-zinc-300/70 bg-zinc-100/40 text-center dark:border-zinc-700/70 dark:bg-white/[0.02] ${SIZES[format]} ${className}`}
      aria-hidden
    >
      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
          {label}
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
          Ad space — configure NEXT_PUBLIC_ADSENSE_CLIENT
        </p>
      </div>
    </div>
  );
}
