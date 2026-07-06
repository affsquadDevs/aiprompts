"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PackCard } from "@/components/pack-card";
import { AdSlot } from "@/components/ad-slot";
import {
  CLIENT_CATEGORIES,
  CLIENT_PACKS,
  allModels,
  filterPacks,
  type SortMode,
} from "@/data/client";
import type { Medium } from "@/data/types";

const PAGE = 24;
const MEDIA: (Medium | "all")[] = ["all", "text", "image", "video", "audio", "3d"];
const SORTS: { id: SortMode; label: string }[] = [
  { id: "popular", label: "Most popular" },
  { id: "size", label: "Most prompts" },
  { id: "az", label: "A–Z" },
];

export function PacksExplorer() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [medium, setMedium] = useState<Medium | "all">("all");
  const [model, setModel] = useState("all");
  const [sort, setSort] = useState<SortMode>("popular");
  const [visible, setVisible] = useState(PAGE);

  // Initialise from URL (?q=, ?category=)
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategoryId(searchParams.get("category") ?? "all");
  }, [searchParams]);

  const models = useMemo(() => allModels(), []);

  const results = useMemo(
    () => filterPacks(CLIENT_PACKS, { query, categoryId, medium, model, sort }),
    [query, categoryId, medium, model, sort],
  );

  useEffect(() => setVisible(PAGE), [query, categoryId, medium, model, sort]);

  const activeCategory = CLIENT_CATEGORIES.find((c) => c.id === categoryId);
  const hasFilters = query || categoryId !== "all" || medium !== "all" || model !== "all";

  function reset() {
    setQuery("");
    setCategoryId("all");
    setMedium("all");
    setModel("all");
    setSort("popular");
    router.replace("/packs");
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Search packs by topic, tool or industry…"
          className="w-full rounded-2xl border border-zinc-200/80 bg-white/80 py-3.5 pl-12 pr-4 text-base text-zinc-800 shadow-sm outline-none transition focus:border-violet-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:focus:border-violet-500"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryId("all")}
          className={chip(categoryId === "all")}
        >
          All
        </button>
        {CLIENT_CATEGORIES.map((c) => (
          <button key={c.id} type="button" onClick={() => setCategoryId(c.id)} className={chip(categoryId === c.id)}>
            {c.name}
            <span className="ml-1 opacity-60">{c.packCount}</span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </span>
        <select value={medium} onChange={(e) => setMedium(e.target.value as Medium | "all")} className={select()}>
          {MEDIA.map((m) => (
            <option key={m} value={m}>
              {m === "all" ? "All media" : m}
            </option>
          ))}
        </select>
        <select value={model} onChange={(e) => setModel(e.target.value)} className={select()}>
          <option value="all">All models</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className={select()}>
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-zinc-500 dark:text-zinc-400">
          {new Intl.NumberFormat("en-US").format(results.length)} packs
        </span>
        {hasFilters ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-rose-300 hover:text-rose-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        ) : null}
      </div>

      {activeCategory ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <strong className="text-zinc-900 dark:text-zinc-100">{activeCategory.name}</strong> — {activeCategory.blurb}
        </p>
      ) : null}

      {/* Results */}
      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300/70 bg-white/40 p-10 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No packs match your search. Try a different keyword or clear the filters.
          </p>
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.slice(0, visible).map((p) => (
              <li key={p.id}>
                <PackCard pack={p} />
              </li>
            ))}
          </ul>
          {visible < results.length ? (
            <div className="space-y-6">
              <AdSlot format="leaderboard" slotId={process.env.NEXT_PUBLIC_AD_SLOT_LIST} />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE)}
                  className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  Show more packs ({new Intl.NumberFormat("en-US").format(results.length - visible)} left)
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-full px-3 py-1.5 text-sm font-medium transition ${
    active
      ? "bg-violet-600 text-white shadow-sm dark:bg-violet-500"
      : "border border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 hover:text-violet-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-violet-500/50"
  }`;
}

function select() {
  return "rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none transition focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";
}
