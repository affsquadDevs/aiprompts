"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Cookie / ad-consent notice backed by Google Consent Mode v2.
 *
 * IMPORTANT — EEA/UK/CH: Google's EU User Consent Policy requires a
 * Google-certified CMP (IAB TCF v2.2). The REQUIRED, primary consent mechanism
 * is therefore Google's certified CMP, enabled in the AdSense console
 * (Privacy & messaging → GDPR message / Funding Choices). When that CMP is
 * present, this component detects it (`__tcfapi` / `googlefc`) and does NOT
 * render, so there is never a double banner and the certified CMP governs
 * consent for regulated regions.
 *
 * This component is a FALLBACK notice for regions without that requirement (and
 * for the window before the certified CMP is configured): it reads the Consent
 * Mode v2 defaults set in `layout.tsx` and, on the visitor's choice, calls
 * `gtag('consent','update', …)` so Google serves personalized vs.
 * non-personalized ads accordingly. The choice is remembered in localStorage.
 */

const STORAGE_KEY = "pv-consent-v1";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __tcfapi?: (...args: unknown[]) => void;
    googlefc?: unknown;
  }
}

/** True when a Google-certified CMP (Funding Choices / IAB TCF) is present. */
function hasCertifiedCmp(): boolean {
  return (
    typeof window !== "undefined" &&
    (typeof window.__tcfapi === "function" || window.googlefc != null)
  );
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
    // Respect a prior choice immediately.
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "granted" || saved === "denied") {
        updateConsent(saved === "granted");
        return;
      }
    } catch {
      /* storage unavailable — fall through to showing the notice */
    }

    // Defer entirely to a Google-certified CMP when one is configured. It may
    // load asynchronously via the AdSense tag, so give it a moment to register
    // before falling back to our own notice.
    if (hasCertifiedCmp()) return;
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled && !hasCertifiedCmp()) setVisible(true);
    }, 1200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
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
