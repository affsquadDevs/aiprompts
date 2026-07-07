"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Cookie / ad-consent banner backed by Google Consent Mode v2.
 *
 * Consent defaults are set to `denied` for EEA/UK/CH visitors in the inline
 * script in `layout.tsx` (which runs before the AdSense loader). This banner
 * lets the visitor grant or refuse, then calls `gtag('consent','update', …)`
 * so Google serves personalized vs. non-personalized ads accordingly. The
 * choice is remembered in localStorage so the banner only appears once.
 *
 * For full IAB TCF v2.2 coverage you can additionally enable Google's
 * certified CMP in the AdSense console (Privacy & messaging) — it co-operates
 * with the same Consent Mode signals used here.
 */

const STORAGE_KEY = "pv-consent-v1";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function updateConsent(granted: boolean) {
  const value = granted ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "granted" || saved === "denied") {
        updateConsent(saved === "granted");
      } else {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(granted: boolean) {
    try {
      localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied");
    } catch {
      /* storage unavailable — still apply for this session */
    }
    updateConsent(granted);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and advertising consent"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700 dark:bg-zinc-900/95">
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          We use cookies to keep the site free by showing ads. With your
          consent, our advertising partner (Google) may use cookies to
          personalize ads and measure performance. See our{" "}
          <Link
            href="/privacy"
            className="font-medium text-violet-700 underline hover:text-violet-600 dark:text-violet-300"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
