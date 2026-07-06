"use client";

import { motion } from "framer-motion";
import { Search, Send, Sparkles, Layers, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const chips = [
  { href: "/packs?q=marketing", label: "Marketing", icon: Sparkles },
  { href: "/packs?q=coding", label: "Coding", icon: Layers },
  { href: "/categories", label: "All categories", icon: GraduationCap },
] as const;

export function LiquidPromptBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/packs?q=${encodeURIComponent(query)}` : "/packs");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.15 }}
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center p-4 pb-6"
    >
      <div className="pointer-events-auto relative z-10 w-full max-w-2xl">
        <div className="liquid-prompt-dock relative overflow-hidden rounded-[1.65rem] p-1.5">
          <form
            onSubmit={submit}
            className="relative z-[1] flex items-center gap-3 rounded-2xl border border-white/40 bg-white/55 px-3 py-3 text-sm text-zinc-600 shadow-sm backdrop-blur-md transition focus-within:bg-white/75 dark:border-white/10 dark:bg-zinc-800/40 dark:text-zinc-300"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300/80 text-zinc-500 dark:border-zinc-600">
              <Search className="h-4 w-4" />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search free prompt packs — e.g. “landing page”, “SQL”, “Instagram”…"
              className="min-w-0 flex-1 bg-transparent text-left text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="relative z-[1] mt-2 flex flex-wrap justify-center gap-1.5 px-1 pb-1">
            {chips.map(({ href, label, icon: Icon }) => (
              <Link
                key={href + label}
                href={href}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <Icon className="h-3.5 w-3.5 opacity-90" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
