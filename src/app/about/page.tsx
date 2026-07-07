import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, PACK_COUNT_FMT } from "@/lib/seo";
import { getMeta } from "@/data";
import { AdSlot } from "@/components/ad-slot";

export const metadata: Metadata = buildMetadata({
  title: "About PromptVault",
  description:
    `PromptVault is a free, ad-supported library of ${PACK_COUNT_FMT} AI prompt packs for ChatGPT, Claude, Gemini and Midjourney. No accounts, no paywalls.`,
  path: "/about",
});

export default function AboutPage() {
  const meta = getMeta();
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 pb-28">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">About PromptVault</h1>

      <div className="space-y-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          PromptVault is a free, ad-supported library of <strong>{fmt(meta.packCount)} prompt packs</strong> containing{" "}
          <strong>{fmt(meta.promptCount)} ready-to-use AI prompts</strong>. Everything here is free to read and copy —
          no account, no checkout, no paywall.
        </p>
        <p>
          The library is organized into clear categories and dozens of industry &ldquo;playbooks&rdquo;, so you can find
          a prompt for your exact task in seconds, copy it, and paste it into ChatGPT, Claude, Gemini, Midjourney or any
          other model.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Where the prompts come from</h2>
        <p>The catalog is assembled from openly-licensed public collections plus original industry playbooks:</p>
        <ul className="list-inside list-disc space-y-1">
          {meta.generatedFrom.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Open collections are used under their CC0 / MIT licenses. Generated playbook packs are original content.
        </p>

        <h2 className="pt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">How it stays free</h2>
        <p>
          PromptVault is supported entirely by advertising. There is nothing to buy and nothing to sell — the whole
          catalog is open to everyone. Ads keep the lights on so the library can keep growing.
        </p>
      </div>

      <AdSlot format="rectangle" slotId={process.env.NEXT_PUBLIC_AD_SLOT_ABOUT} />

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/packs"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Browse all packs
        </Link>
        <Link
          href="/categories"
          className="rounded-full border border-zinc-300 bg-white/70 px-5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:border-violet-400 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100"
        >
          View categories
        </Link>
      </div>
    </main>
  );
}
