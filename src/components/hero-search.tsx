"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTIONS = ["SEO", "Landing page", "Cold email", "Instagram", "Python", "Resume"];

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function go(query: string) {
    const t = query.trim();
    router.push(t ? `/packs?q=${encodeURIComponent(t)}` : "/packs");
  }

  return (
    <div className="mt-8 w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 p-2 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/60"
      >
        <Search className="ml-2 h-5 w-5 shrink-0 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="What do you want to create today?"
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Search
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Popular:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            className="rounded-full border border-white/50 bg-white/50 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:border-violet-500/40 dark:hover:text-violet-300"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
