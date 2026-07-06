import Link from "next/link";
import Image from "next/image";
import { Layers } from "lucide-react";
import type { PackSummary } from "@/data/types";
import { coverImage } from "@/lib/cover-image";

// Deterministic gradient per category for a lively grid without images.
const CATEGORY_GRADIENT: Record<string, string> = {
  writing: "from-violet-500/30 via-fuchsia-400/20 to-pink-400/20",
  marketing: "from-rose-500/30 via-orange-400/20 to-amber-400/20",
  "social-media": "from-sky-500/30 via-cyan-400/20 to-blue-400/20",
  seo: "from-emerald-500/30 via-teal-400/20 to-lime-400/20",
  business: "from-indigo-500/30 via-blue-400/20 to-violet-400/20",
  "sales-support": "from-amber-500/30 via-yellow-400/20 to-orange-400/20",
  productivity: "from-teal-500/30 via-emerald-400/20 to-cyan-400/20",
  programming: "from-slate-500/30 via-zinc-400/20 to-sky-400/20",
  data: "from-cyan-500/30 via-sky-400/20 to-indigo-400/20",
  design: "from-fuchsia-500/30 via-pink-400/20 to-rose-400/20",
  education: "from-blue-500/30 via-indigo-400/20 to-violet-400/20",
  finance: "from-green-500/30 via-emerald-400/20 to-teal-400/20",
  legal: "from-stone-500/30 via-zinc-400/20 to-slate-400/20",
  health: "from-lime-500/30 via-green-400/20 to-emerald-400/20",
  lifestyle: "from-orange-500/30 via-amber-400/20 to-yellow-400/20",
  fun: "from-purple-500/30 via-violet-400/20 to-fuchsia-400/20",
};

export function PackCard({ pack }: { pack: PackSummary }) {
  const gradient = CATEGORY_GRADIENT[pack.categoryId] ?? "from-violet-500/30 via-sky-400/20 to-cyan-400/20";
  const cover = coverImage(pack, 640);
  return (
    <Link
      href={`/packs/${pack.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-violet-300/70 hover:shadow-[0_18px_40px_rgba(99,102,241,0.16)] dark:border-zinc-800 dark:bg-zinc-950/70 dark:hover:border-violet-500/40"
    >
      <div className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${gradient}`}>
        <Image
          src={cover}
          alt={`${pack.title} cover`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <Layers className="absolute bottom-3 right-3 h-6 w-6 text-white/80 drop-shadow" strokeWidth={1.5} />
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 shadow-sm backdrop-blur dark:bg-zinc-900/80 dark:text-zinc-200">
          {pack.categoryName}
        </span>
        <span className="absolute right-3 top-3 rounded-full border border-emerald-300/70 bg-emerald-500/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
          Free
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-snug text-zinc-900 transition group-hover:text-violet-700 dark:text-zinc-100 dark:group-hover:text-violet-300">
          {pack.title}
        </h3>
        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{pack.subtitle}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
            <Layers className="h-3.5 w-3.5" />
            {pack.promptCount} prompts
          </span>
          <span className="truncate">{pack.models.slice(0, 3).join(" · ")}</span>
        </div>
      </div>
    </Link>
  );
}
