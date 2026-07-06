"use client";

import { useEffect, useRef } from "react";

/**
 * Ad placement slot.
 *
 * The whole site is free and ad-supported. Drop your ad code here once:
 *  - Set NEXT_PUBLIC_ADSENSE_CLIENT (e.g. "ca-pub-1234567890123456") and pass a
 *    `slotId` to render a real Google AdSense unit, OR
 *  - Replace the placeholder block below with any ad network's snippet.
 *
 * Until a client id is configured, a clearly-labelled placeholder is shown so
 * you can see exactly where ads will appear.
 */

type AdFormat = "leaderboard" | "rectangle" | "inline" | "sidebar";

const SIZES: Record<AdFormat, string> = {
  leaderboard: "min-h-[90px] w-full",
  rectangle: "min-h-[250px] w-full max-w-[336px] mx-auto",
  inline: "min-h-[120px] w-full",
  sidebar: "min-h-[600px] w-full",
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

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
    if (!ADSENSE_CLIENT || !slotId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* ad blocker or not ready — ignore */
    }
  }, [slotId]);

  if (ADSENSE_CLIENT && slotId) {
    return (
      <div className={`overflow-hidden ${SIZES[format]} ${className}`} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

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
