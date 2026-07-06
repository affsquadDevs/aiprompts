import { Suspense } from "react";
import { PacksExplorer } from "@/components/packs-explorer";
import { getMeta } from "@/data";

export default function PacksPage() {
  const meta = getMeta();
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 pb-28">
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
