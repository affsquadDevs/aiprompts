import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, Copy, Layers, Tag } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { CopyButton } from "@/components/copy-button";
import { PackCard } from "@/components/pack-card";
import { AdSlot } from "@/components/ad-slot";
import {
  absoluteUrl,
  breadcrumbLd,
  buildMetadata,
  clampDescription,
  ogImageUrl,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { coverImage } from "@/lib/cover-image";
import {
  getAllPackIds,
  getCategory,
  getPack,
  getRelatedPacks,
} from "@/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPackIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pack = getPack(id);
  if (!pack) {
    return buildMetadata({ title: "Pack not found", path: `/packs/${id}`, noIndex: true });
  }
  return buildMetadata({
    title: `${pack.title} — ${pack.promptCount} Free AI Prompts`,
    description: clampDescription(`${pack.subtitle}. ${pack.description}`),
    path: `/packs/${pack.id}`,
    type: "article",
    image: ogImageUrl({
      eyebrow: pack.categoryName,
      title: pack.title,
      note: `${pack.promptCount} free prompts · ${pack.models.slice(0, 3).join(" · ")}`,
    }),
  });
}

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pack = getPack(id);
  if (!pack) notFound();

  const category = getCategory(pack.categoryId);
  const related = getRelatedPacks(pack, 6);
  const allText = pack.prompts.map((p) => `## ${p.title}\n\n${p.content}`).join("\n\n---\n\n");

  const creativeWorkLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: pack.title,
    headline: pack.title,
    description: clampDescription(`${pack.subtitle}. ${pack.description}`),
    about: pack.categoryName,
    keywords: pack.tags.join(", "),
    inLanguage: "en",
    isAccessibleForFree: true,
    isFamilyFriendly: true,
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    genre: pack.categoryName,
    url: absoluteUrl(`/packs/${pack.id}`),
    image: ogImageUrl({ eyebrow: pack.categoryName, title: pack.title }),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(pack.source?.name
      ? { creditText: pack.source.name, sdLicense: pack.source.license }
      : {}),
    hasPart: pack.prompts.slice(0, 25).map((p) => ({
      "@type": "CreativeWork",
      name: p.title,
      isAccessibleForFree: true,
    })),
  };

  const breadcrumb = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: "Packs", path: "/packs" },
    ...(category ? [{ name: category.name, path: `/packs?category=${category.id}` }] : []),
    { name: pack.title, path: `/packs/${pack.id}` },
  ]);

  return (
    <>
      <JsonLd data={[creativeWorkLd, breadcrumb]} />
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 pb-28 sm:py-10">
        <nav className="flex items-center gap-1.5 text-sm text-zinc-500">
          <Link href="/packs" className="inline-flex items-center gap-1 text-violet-700 hover:underline dark:text-violet-300">
            <ArrowLeft className="h-3.5 w-3.5" />
            Packs
          </Link>
          <span>/</span>
          {category ? (
            <Link href={`/packs?category=${category.id}`} className="hover:underline">
              {category.name}
            </Link>
          ) : null}
        </nav>

        {/* Cover */}
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
          <Image
            src={coverImage(pack, 1280)}
            alt={`${pack.title} cover`}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/70 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
              Free
            </span>
            {category ? (
              <Link
                href={`/packs?category=${category.id}`}
                className="rounded-full border border-violet-200/60 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-800 transition hover:bg-violet-500/20 dark:border-violet-500/20 dark:text-violet-200"
              >
                {category.name}
              </Link>
            ) : null}
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Layers className="h-3.5 w-3.5" />
              {pack.promptCount} prompts
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">{pack.title}</h1>
          <p className="text-lg text-violet-800 dark:text-violet-200/90">{pack.subtitle}</p>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{pack.description}</p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <Bot className="h-3.5 w-3.5" /> Works with:
            </span>
            {pack.models.map((m) => (
              <span
                key={m}
                className="rounded-full border border-zinc-200/80 bg-zinc-100/60 px-2.5 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
              >
                {m}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <CopyButton text={allText} label={`Copy all ${pack.promptCount} prompts`} copiedLabel="All copied!" />
            {pack.tags.length ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {pack.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-zinc-100/70 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
                    <Tag className="h-3 w-3 opacity-70" />
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <AdSlot format="leaderboard" slotId={process.env.NEXT_PUBLIC_AD_SLOT_DETAIL} />

        {/* Prompts */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-zinc-500" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">What&rsquo;s inside</h2>
            <span className="text-sm text-zinc-500">({pack.promptCount})</span>
          </div>
          <ul className="space-y-4">
            {pack.prompts.map((p, i) => (
              <li key={p.id} className="liquid-glass rounded-2xl border border-white/30 p-4 sm:p-5 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    <span className="mr-2 text-zinc-400">{i + 1}.</span>
                    {p.title}
                  </h3>
                  <CopyButton text={p.content} size="sm" />
                </div>
                <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50/80 p-4 font-sans text-sm leading-relaxed text-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
                  {p.content}
                </pre>
              </li>
            ))}
          </ul>
        </section>

        {pack.source ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Source:{" "}
            {pack.source.url ? (
              <a href={pack.source.url} target="_blank" rel="noreferrer" className="underline hover:text-violet-700 dark:hover:text-violet-300">
                {pack.source.name}
              </a>
            ) : (
              pack.source.name
            )}{" "}
            · {pack.source.license}
          </p>
        ) : null}

        {/* Related */}
        {related.length ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Related packs</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <PackCard pack={p} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}
