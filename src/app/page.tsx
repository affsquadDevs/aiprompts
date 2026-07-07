import { LandingView } from "@/components/landing-view";
import { LiquidPromptBar } from "@/components/liquid-prompt-bar";
import { JsonLd } from "@/components/json-ld";
import {
  getCategories,
  getFeaturedPacks,
  getMeta,
  getPacksAcrossCategories,
} from "@/data";
import {
  faqLd,
  itemListLd,
  PACK_COUNT_FMT,
  PROMPT_COUNT_FMT,
} from "@/lib/seo";

const FAQS = [
  {
    q: "Is PromptsVault free to use?",
    a: `Yes. Every one of the ${PACK_COUNT_FMT} prompt packs and ${PROMPT_COUNT_FMT} prompts is completely free to read and copy. The site is supported by ads — there is no account, checkout or paywall.`,
  },
  {
    q: "Do I need to sign up or create an account?",
    a: "No. You can browse, search and copy any prompt instantly without registering, logging in or entering payment details.",
  },
  {
    q: "Which AI models do these prompts work with?",
    a: "The prompts are model-agnostic and work with ChatGPT (GPT-4/5), Claude, Google Gemini, Midjourney and most other large language and image models. Just copy a prompt and paste it into your tool of choice.",
  },
  {
    q: "How do I use a prompt pack?",
    a: "Open any pack, click Copy on a prompt (or copy the whole pack), paste it into your AI assistant, and tweak the placeholders for your task.",
  },
  {
    q: "How many prompts are available?",
    a: `PromptsVault currently offers ${PACK_COUNT_FMT} curated prompt packs containing ${PROMPT_COUNT_FMT} ready-to-use prompts across categories like writing, marketing, SEO, coding, design and more.`,
  },
  {
    q: "Can I use these prompts for commercial work?",
    a: "Yes. The prompts are provided for free use, including commercial projects. Individual packs list their original source and license where applicable.",
  },
];

export default function Home() {
  const categories = getCategories();
  const featuredPacks = getFeaturedPacks(8);
  const spotlightPacks = getPacksAcrossCategories(1, 12);
  const meta = getMeta();

  return (
    <main className="min-w-0 flex-1">
      <JsonLd
        data={[faqLd(FAQS), itemListLd("Featured prompt packs", featuredPacks)]}
      />
      <LandingView
        categories={categories}
        featuredPacks={featuredPacks}
        spotlightPacks={spotlightPacks}
        meta={meta}
      />

      <section className="mx-auto max-w-3xl px-4 pb-24 pt-4">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-zinc-200/80 bg-white/70 p-4 open:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60"
            >
              <summary className="cursor-pointer list-none font-semibold text-zinc-900 marker:content-none dark:text-zinc-100">
                {f.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <LiquidPromptBar />
    </main>
  );
}
