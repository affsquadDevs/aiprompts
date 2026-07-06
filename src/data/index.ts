// Server-side data access for the static prompt catalog.
//
// IMPORTANT: this module imports the full 7MB catalog.json — only use it from
// Server Components, generateStaticParams, sitemap, etc. Client components that
// need to search should import the lightweight `@/data/client` index instead.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Category, CatalogMeta, Pack, PackSummary } from "./types";

// Read the full catalog from disk at module load (build time for SSG pages).
// Avoids bundling / type-checking the 7MB JSON literal through the TS importer.
const data = JSON.parse(
  readFileSync(join(process.cwd(), "src", "data", "catalog.json"), "utf8"),
) as {
  categories: Category[];
  packs: Pack[];
  meta: CatalogMeta;
};

const PACKS: Pack[] = data.packs;
const CATEGORIES: Category[] = data.categories;
const PACK_BY_ID = new Map(PACKS.map((p) => [p.id, p]));
const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

function toSummary(p: Pack): PackSummary {
  const { id, title, subtitle, categoryId, categoryName, medium, models, tags, promptCount, popularity } = p;
  return { id, title, subtitle, categoryId, categoryName, medium, models, tags, promptCount, popularity };
}

export function getMeta(): CatalogMeta {
  return data.meta;
}

export function getCategories(): Category[] {
  return CATEGORIES;
}

export function getCategory(id: string): Category | undefined {
  return CATEGORY_BY_ID.get(id);
}

export function getAllPackIds(): string[] {
  return PACKS.map((p) => p.id);
}

export function getPack(id: string): Pack | undefined {
  return PACK_BY_ID.get(id);
}

export function getPacksByCategory(categoryId: string): PackSummary[] {
  return PACKS.filter((p) => p.categoryId === categoryId).map(toSummary);
}

/** Most popular packs overall (catalog is already sorted by popularity). */
export function getFeaturedPacks(limit = 8): PackSummary[] {
  return PACKS.slice(0, limit).map(toSummary);
}

/** A spread of top packs across distinct categories, for the home page. */
export function getPacksAcrossCategories(perCategory = 1, limit = 12): PackSummary[] {
  const counts = new Map<string, number>();
  const out: PackSummary[] = [];
  for (const p of PACKS) {
    const n = counts.get(p.categoryId) ?? 0;
    if (n >= perCategory) continue;
    counts.set(p.categoryId, n + 1);
    out.push(toSummary(p));
    if (out.length >= limit) break;
  }
  return out;
}

/** Related packs: same category first, then shared tags. */
export function getRelatedPacks(pack: Pack, limit = 6): PackSummary[] {
  const tagSet = new Set(pack.tags);
  const scored = PACKS.filter((p) => p.id !== pack.id)
    .map((p) => {
      let score = 0;
      if (p.categoryId === pack.categoryId) score += 3;
      for (const t of p.tags) if (tagSet.has(t)) score += 1;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.popularity - a.p.popularity)
    .slice(0, limit);
  return scored.map((x) => toSummary(x.p));
}

export function totalPromptsInCategory(categoryId: string): number {
  return PACKS.reduce((n, p) => (p.categoryId === categoryId ? n + p.promptCount : n), 0);
}
