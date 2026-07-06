"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  className = "",
  size = "md",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older / insecure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [text]);

  const pad = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? copiedLabel : label}
      className={`inline-flex items-center gap-1.5 rounded-xl font-medium transition ${pad} ${
        copied
          ? "border border-emerald-300/70 bg-emerald-500/15 text-emerald-800 dark:border-emerald-500/30 dark:text-emerald-200"
          : "border border-zinc-300 bg-white/80 text-zinc-800 hover:border-violet-400 hover:bg-violet-50/80 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:border-violet-500 dark:hover:bg-violet-950/30"
      } ${className}`}
    >
      {copied ? <Check className={icon} /> : <Copy className={icon} />}
      {copied ? copiedLabel : label}
    </button>
  );
}
