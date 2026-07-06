import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Brush,
  Briefcase,
  Code2,
  Copy,
  Database,
  GraduationCap,
  Heart,
  Landmark,
  MessageSquare,
  PenLine,
  Plane,
  Rocket,
  Scale,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  Wand2,
} from "lucide-react";
import type { Category, CatalogMeta, PackSummary } from "@/data/types";
import { PackCard } from "@/components/pack-card";
import { MarqueeStrip } from "@/components/marquee-strip";
import { HeroSearch } from "@/components/hero-search";
import { AdSlot } from "@/components/ad-slot";

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  writing: PenLine,
  marketing: TrendingUp,
  "social-media": Share2,
  seo: Search,
  business: Briefcase,
  "sales-support": MessageSquare,
  productivity: Rocket,
  programming: Code2,
  data: Database,
  design: Brush,
  education: GraduationCap,
  finance: Landmark,
  legal: Scale,
  health: Heart,
  lifestyle: Plane,
  fun: Wand2,
};

const cardShell =
  "liquid-glass rounded-[1.75rem] p-6 transition duration-300 hover:shadow-[0_24px_64px_rgba(99,102,241,0.14)] dark:hover:shadow-[0_24px_56px_rgba(0,0,0,0.5)]";

function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

const STEPS = [
  { icon: Search, title: "Find a pack", text: "Browse 16 categories or search 1,000+ packs by topic, tool, or industry." },
  { icon: Copy, title: "Copy a prompt", text: "Every prompt is unlocked and free. Copy it with one click — no sign-up." },
  { icon: Bot, title: "Paste & run", text: "Drop it into ChatGPT, Claude, Gemini, Midjourney and fill in the blanks." },
];

export function LandingView({
  categories,
  featuredPacks,
  spotlightPacks,
  meta,
}: {
  categories: Category[];
  featuredPacks: PackSummary[];
  spotlightPacks: PackSummary[];
  meta: CatalogMeta;
}) {
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

  return (
    <div className="relative min-w-0 pb-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-3 pt-4 sm:px-4 lg:px-5">
        {/* Hero */}
        <section className={`liquid-glass-hero relative overflow-hidden ${cardShell} px-6 py-10 sm:px-10 sm:py-12`}>
          <div className="absolute -right-6 -top-6 z-0 h-40 w-40 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/15" />
          <div className="absolute -bottom-10 -left-10 z-0 h-36 w-36 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/12" />
          <div className="relative z-[1]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-500/20 dark:text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              100% free · no account needed
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {fmt(meta.packCount)}+ free AI prompt packs, ready to copy
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
              A growing library of {fmt(meta.promptCount)} hand-organized prompts for ChatGPT, Claude, Gemini and
              Midjourney — sorted into {categories.length} categories and dozens of industries. Find one, copy it, and
              get a head start. No paywalls, no logins.
            </p>
            <HeroSearch />
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {[
                ["Prompt packs", `${fmt(meta.packCount)}+`],
                ["Total prompts", `${fmt(meta.promptCount)}+`],
                ["Categories", String(categories.length)],
                ["Price", "Free"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{value}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MarqueeStrip />

        <AdSlot format="leaderboard" slotId={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

        {/* Categories */}
        <section className={`${cardShell} space-y-4`} id="categories">
          <SectionTitle
            title="Browse by category"
            subtitle="Jump straight to the prompts for your job."
            action={
              <Link href="/categories" className="shrink-0 text-sm font-medium text-violet-700 hover:underline dark:text-violet-300">
                All categories →
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => {
              const Icon = CATEGORY_ICON[c.id] ?? Sparkles;
              return (
                <Link
                  key={c.id}
                  href={`/packs?category=${encodeURIComponent(c.id)}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white/50 bg-white/50 p-3.5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-violet-300/80 hover:bg-violet-50/70 dark:border-white/10 dark:bg-zinc-800/40 dark:hover:border-violet-500/40 dark:hover:bg-violet-950/20"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 text-violet-700 dark:text-violet-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">{c.packCount} packs</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured packs */}
        <section className={`${cardShell} space-y-4`} id="featured">
          <SectionTitle
            title="Trending packs"
            subtitle="The most-loved collections in the library right now."
            action={
              <Link href="/packs" className="shrink-0 text-sm font-medium text-violet-700 hover:underline dark:text-violet-300">
                Browse all →
              </Link>
            }
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPacks.map((p) => (
              <li key={p.id}>
                <PackCard pack={p} />
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className={`${cardShell} space-y-5`}>
          <SectionTitle title="How it works" subtitle="Three steps, zero friction." />
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-white/40 bg-white/40 p-5 dark:border-white/10 dark:bg-zinc-800/30">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-white shadow-md">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{s.title}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <AdSlot format="leaderboard" slotId={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

        {/* One per category spotlight */}
        <section className={`${cardShell} space-y-4`}>
          <SectionTitle
            title="A taste of every category"
            subtitle="One standout pack from across the library."
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spotlightPacks.map((p) => (
              <li key={p.id}>
                <PackCard pack={p} />
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="overflow-hidden rounded-[1.75rem] border border-violet-300/50 bg-gradient-to-br from-violet-600 to-indigo-600 px-6 py-10 text-center shadow-[0_20px_60px_rgba(99,102,241,0.35)] sm:px-10">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Find your next prompt in seconds</h2>
          <p className="mx-auto mt-2 max-w-xl text-violet-100">
            Everything here is free and ad-supported. Browse the full library — no account, no checkout, no catch.
          </p>
          <Link
            href="/packs"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-md transition hover:bg-violet-50"
          >
            Explore all {fmt(meta.packCount)} packs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <Footer meta={meta} />
      </div>
    </div>
  );
}

export function Footer({ meta }: { meta: CatalogMeta }) {
  return (
    <footer className="liquid-glass rounded-[1.75rem] px-4 py-6 sm:px-6">
      <div className="rounded-2xl border border-white/50 bg-white/35 px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
        PromptVault provides free educational and productivity prompt templates. Prompts are sourced from openly-licensed
        public collections (CC0 / MIT) and original industry playbooks. Always review AI-generated content before using
        it for important work.
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium">
        <Link href="/" className="text-zinc-700 transition hover:text-violet-700 dark:text-zinc-300 dark:hover:text-violet-300">Home</Link>
        <Link href="/packs" className="text-zinc-700 transition hover:text-violet-700 dark:text-zinc-300 dark:hover:text-violet-300">Packs</Link>
        <Link href="/categories" className="text-zinc-700 transition hover:text-violet-700 dark:text-zinc-300 dark:hover:text-violet-300">Categories</Link>
        <Link href="/about" className="text-zinc-700 transition hover:text-violet-700 dark:text-zinc-300 dark:hover:text-violet-300">About</Link>
      </div>
      <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-500">
        © 2026 PromptVault · {new Intl.NumberFormat("en-US").format(meta.packCount)} free packs · Ad-supported
      </p>
    </footer>
  );
}
