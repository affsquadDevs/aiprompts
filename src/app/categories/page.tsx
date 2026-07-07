import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  absoluteUrl,
  breadcrumbLd,
  buildMetadata,
  SITE_NAME,
} from "@/lib/seo";
import { AdSlot } from "@/components/ad-slot";
import { JsonLd } from "@/components/json-ld";
import { PackCard } from "@/components/pack-card";
import {
  getCategories,
  getMeta,
  getPacksByCategory,
  totalPromptsInCategory,
} from "@/data";

export const metadata: Metadata = buildMetadata({
  title: "All Prompt Categories",
  description:
    "Explore every category of free AI prompts — writing, marketing, SEO, coding, design, data, education and more. Pick a category and start copying.",
  path: "/categories",
});

export default function CategoriesPage() {
  const categories = getCategories();
  const meta = getMeta();
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All AI prompt categories",
    url: absoluteUrl("/categories"),
    isPartOf: { "@type": "WebSite", name: SITE_NAME },
    isAccessibleForFree: true,
    hasPart: categories.map((c) => ({
      "@type": "CollectionPage",
      name: c.name,
      url: absoluteUrl(`/categories/${c.id}`),
    })),
  };
  const breadcrumb = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 pb-28">
      <JsonLd data={[collectionLd, breadcrumb]} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Categories</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {categories.length} categories · {fmt(meta.packCount)} packs · {fmt(meta.promptCount)} prompts — all free.
        </p>
      </header>

      <AdSlot format="leaderboard" slotId={process.env.NEXT_PUBLIC_AD_SLOT_CATEGORIES} />

      <div className="space-y-10">
        {categories.map((c) => {
          const top = getPacksByCategory(c.id)
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 4);
          return (
            <section key={c.id} className="space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    <Link href={`/categories/${c.id}`} className="hover:text-violet-700 hover:underline dark:hover:text-violet-300">
                      {c.name}
                    </Link>
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {c.blurb} · {c.packCount} packs · {fmt(totalPromptsInCategory(c.id))} prompts
                  </p>
                </div>
                <Link
                  href={`/categories/${c.id}`}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-violet-700 hover:underline dark:text-violet-300"
                >
                  See all {c.packCount} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {top.map((p) => (
                  <li key={p.id}>
                    <PackCard pack={p} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
