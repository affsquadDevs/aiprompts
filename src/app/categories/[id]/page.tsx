import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, HelpCircle, Layers } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { PackCard } from "@/components/pack-card";
import { AdSlot } from "@/components/ad-slot";
import {
  absoluteUrl,
  breadcrumbLd,
  buildMetadata,
  clampDescription,
  faqLd,
  itemListLd,
  ogImageUrl,
  SITE_NAME,
} from "@/lib/seo";
import { categoryContent, categoryFaq } from "@/lib/category-content";
import {
  getCategories,
  getCategory,
  getPacksByCategory,
  totalPromptsInCategory,
} from "@/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((c) => ({ id: c.id }));
}

const nf = new Intl.NumberFormat("en-US");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const category = getCategory(id);
  if (!category) {
    return buildMetadata({ title: "Category not found", path: `/categories/${id}`, noIndex: true });
  }
  const content = categoryContent(category.id, category.blurb);
  const packCount = category.packCount;
  const promptCount = totalPromptsInCategory(category.id);
  return buildMetadata({
    title: `${category.name} Prompts — ${nf.format(packCount)} Free AI Prompt Packs`,
    description: clampDescription(content.intro),
    path: `/categories/${category.id}`,
    image: ogImageUrl({
      eyebrow: "Category",
      title: `${category.name} Prompts`,
      note: `${nf.format(packCount)} free packs · ${nf.format(promptCount)} prompts`,
    }),
  });
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = getCategory(id);
  if (!category) notFound();

  const content = categoryContent(category.id, category.blurb);
  const allPacks = getPacksByCategory(category.id);
  const featured = [...allPacks].sort((a, b) => b.popularity - a.popularity).slice(0, 24);
  const alphabetical = [...allPacks].sort((a, b) => a.title.localeCompare(b.title));
  const packCount = category.packCount;
  const promptCount = totalPromptsInCategory(category.id);

  const faq = categoryFaq(category.name, nf.format(packCount), nf.format(promptCount));

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} AI Prompt Packs`,
    description: clampDescription(content.intro),
    url: absoluteUrl(`/categories/${category.id}`),
    isPartOf: { "@type": "WebSite", name: SITE_NAME },
    isAccessibleForFree: true,
    about: category.name,
  };
  const breadcrumb = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: category.name, path: `/categories/${category.id}` },
  ]);
  const list = itemListLd(`Popular ${category.name} packs`, featured);

  return (
    <>
      <JsonLd data={[collectionLd, breadcrumb, list, faqLd(faq)]} />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 pb-28">
        <nav className="flex items-center gap-1.5 text-sm text-zinc-500">
          <Link href="/categories" className="inline-flex items-center gap-1 text-violet-700 hover:underline dark:text-violet-300">
            <ArrowLeft className="h-3.5 w-3.5" />
            All categories
          </Link>
        </nav>

        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {category.name} Prompts
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            {content.intro}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {nf.format(packCount)} free packs · {nf.format(promptCount)} prompts · copy any prompt, no sign-up required.
          </p>
        </header>

        {content.useCases.length ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">What you can do</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {content.useCases.map((u) => (
                <li key={u} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {u}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <AdSlot format="leaderboard" slotId={process.env.NEXT_PUBLIC_AD_SLOT_CATEGORY_DETAIL} />

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Popular {category.name} packs</h2>
            <Link
              href={`/packs?category=${category.id}`}
              rel="nofollow"
              className="text-sm font-medium text-violet-700 hover:underline dark:text-violet-300"
            >
              Search &amp; filter all {nf.format(packCount)} →
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <li key={p.id}>
                <PackCard pack={p} />
              </li>
            ))}
          </ul>
        </section>

        {/* Full crawlable index — every pack in the category gets an internal link. */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-zinc-500" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              All {nf.format(packCount)} {category.name} packs
            </h2>
          </div>
          <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {alphabetical.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/packs/${p.id}`}
                  className="text-sm text-zinc-600 transition hover:text-violet-700 hover:underline dark:text-zinc-400 dark:hover:text-violet-300"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-zinc-500" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {faq.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-zinc-200/80 bg-white/70 p-4 open:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60"
              >
                <summary className="cursor-pointer list-none font-semibold text-zinc-900 marker:content-none dark:text-zinc-100">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
