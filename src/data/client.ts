// Lightweight catalog index for client-side search & filtering.
// Safe to import in Client Components: contains pack summaries only
// (titles, categories, tags, counts) — no prompt bodies.

import index from "./index.json";
import type { Category, CatalogMeta, Medium, PackSummary } from "./types";

const data = index as unknown as {
  categories: Category[];
  packs: PackSummary[];
  meta: CatalogMeta;
};

export const CLIENT_CATEGORIES: Category[] = data.categories;
export const CLIENT_PACKS: PackSummary[] = data.packs;
export const CLIENT_META: CatalogMeta = data.meta;

export type SortMode = "popular" | "az" | "size";

export type PackFilters = {
  query?: string;
  categoryId?: string;
  medium?: Medium | "all";
  model?: string | "all";
  sort?: SortMode;
};

export function filterPacks(packs: PackSummary[], f: PackFilters): PackSummary[] {
  const q = (f.query ?? "").trim().toLowerCase();
  const terms = q ? q.split(/\s+/) : [];

  let out = packs.filter((p) => {
    if (f.categoryId && f.categoryId !== "all" && p.categoryId !== f.categoryId) return false;
    if (f.medium && f.medium !== "all" && p.medium !== f.medium) return false;
    if (f.model && f.model !== "all" && !p.models.includes(f.model)) return false;
    if (terms.length) {
      const hay = `${p.title} ${p.subtitle} ${p.categoryName} ${p.tags.join(" ")}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });

  switch (f.sort) {
    case "az":
      out = [...out].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "size":
      out = [...out].sort((a, b) => b.promptCount - a.promptCount || b.popularity - a.popularity);
      break;
    case "popular":
    default:
      out = [...out].sort((a, b) => b.popularity - a.popularity);
      break;
  }
  return out;
}

/** All distinct models in the catalog, ordered by frequency. */
export function allModels(): string[] {
  const counts = new Map<string, number>();
  for (const p of CLIENT_PACKS) for (const m of p.models) counts.set(m, (counts.get(m) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([m]) => m);
}
