import { Suspense } from "react";
import { PacksExplorer } from "@/components/packs-explorer";
import { JsonLd } from "@/components/json-ld";
import { getFeaturedPacks, getMeta } from "@/data";
import {
  absoluteUrl,
  breadcrumbLd,
  itemListLd,
  PACK_COUNT_FMT,
  PROMPT_COUNT_FMT,
  SITE_NAME,
} from "@/lib/seo";

export default function PacksPage() {
  const meta = getMeta();
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
  const featured = getFeaturedPacks(20);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Browse ${PACK_COUNT_FMT} Free AI Prompt Packs`,
    description: `A free library of ${PACK_COUNT_FMT} AI prompt packs (${PROMPT_COUNT_FMT} prompts).`,
    url: absoluteUrl("/packs"),
    isPartOf: { "@type": "WebSite", name: SITE_NAME },
    isAccessibleForFree: true,
  };
  const breadcrumb = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: "Packs", path: "/packs" },
  ]);
  const list = itemListLd("Featured prompt packs", featured);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 pb-28">
      <JsonLd data={[collectionLd, breadcrumb, list]} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Prompt packs</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {fmt(meta.packCount)} free packs · {fmt(meta.promptCount)} prompts · copy any prompt, no sign-up required.
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading library…</p>}>
        <PacksExplorer />
      </Suspense>
    </main>
  );
}
