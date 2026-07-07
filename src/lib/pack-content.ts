// Deterministic, per-pack editorial enrichment.
//
// Purpose: the catalog contains many packs generated from a small set of
// templates. To keep every page substantial and UNIQUE (rather than thin or
// near-duplicate), we render page-specific editorial content — an overview,
// how-to, audience, tips and an FAQ — assembled from each pack's real
// attributes (subject, models, prompt count, category, first prompt) and
// seeded by a hash of the pack id so sibling packs diverge in structure, not
// just in nouns. No runtime randomness → stable SSG output.

import type { Pack } from "@/data/types";
import { SITE_NAME } from "@/lib/seo";

export type PackFaq = { q: string; a: string };

export type PackEnrichment = {
  overview: string;
  audience: string[];
  howTo: { title: string; text: string }[];
  tips: string[];
  faq: PackFaq[];
};

/* --------------------------------------------------------------- *
 * Deterministic helpers (djb2 with a salt so sections vary
 * independently for the same pack).
 * --------------------------------------------------------------- */

function hash(str: string, salt = 0): number {
  let h = 5381 + salt;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

/** n distinct items, starting at a hash-chosen offset (wraps). */
function pickN<T>(arr: T[], n: number, seed: number): T[] {
  const out: T[] = [];
  const len = arr.length;
  const start = seed % len;
  for (let i = 0; i < Math.min(n, len); i++) out.push(arr[(start + i) % len]);
  return out;
}

function joinModels(models: string[]): string {
  const m = models.slice(0, 3);
  if (m.length === 0) return "ChatGPT";
  if (m.length === 1) return m[0];
  return `${m.slice(0, -1).join(", ")} and ${m[m.length - 1]}`;
}

/* --------------------------------------------------------------- *
 * Subject derivation — what the pack is actually about.
 * --------------------------------------------------------------- */

type Subject = {
  kind: "playbook" | "role" | "platform" | "task" | "curated";
  /** Proper-case label, e.g. "E-commerce", "Copywriters", "Instagram". */
  label: string;
  /** Noun phrase for prose, e.g. "e-commerce teams", "copywriters". */
  phrase: string;
};

function deriveSubject(pack: Pack): Subject {
  const tags = pack.tags || [];
  const forIdx = pack.title.lastIndexOf(" for ");
  const afterFor = forIdx >= 0 ? pack.title.slice(forIdx + 5).trim() : "";

  if (tags.includes("playbook") && afterFor) {
    // Keep the industry label's own casing (e.g. "SaaS", "E-commerce").
    return { kind: "playbook", label: afterFor, phrase: `${afterFor} teams` };
  }
  if (tags.includes("role") && afterFor) {
    return { kind: "role", label: afterFor, phrase: afterFor.toLowerCase() };
  }
  if (tags.includes("platform")) {
    const platform = pack.title.split(" ")[0];
    return { kind: "platform", label: platform, phrase: `creators growing on ${platform}` };
  }
  if (tags.includes("everyday")) {
    const task = pack.title.replace(/ Prompt Pack$/i, "").trim();
    return { kind: "task", label: task, phrase: task.toLowerCase() };
  }
  return { kind: "curated", label: pack.categoryName, phrase: pack.categoryName.toLowerCase() };
}

/* --------------------------------------------------------------- *
 * Content pools. Sections compose from several pools seeded by
 * different salts so two packs rarely read the same way.
 * --------------------------------------------------------------- */

const OPENERS = [
  (t: string, c: number, s: string) => `The ${t} gathers ${c} ready-to-run prompts for ${s}.`,
  (t: string, c: number, s: string) => `This pack collects ${c} practical, copy-and-paste prompts made for ${s}.`,
  (t: string, c: number, s: string) => `Inside the ${t} you'll find ${c} prompts built specifically for ${s}.`,
  (t: string, c: number, s: string) => `${t} gives ${s} a focused set of ${c} prompts to work from.`,
  (t: string, c: number, s: string) => `We put together ${c} prompts in the ${t} so ${s} can skip the blank page.`,
  (t: string, c: number, s: string) => `A tight, ${c}-prompt toolkit — the ${t} is aimed squarely at ${s}.`,
];

const VALUES = [
  " Each one is written to save you the blank-page problem: open it, add your specifics, and get a strong first draft in seconds.",
  " The structure is already done, so instead of engineering a prompt you just fill in what makes your situation unique.",
  " Every prompt is unlocked and free — copy the whole set, or grab only the one you need right now.",
  " They're meant to be a starting point you edit, not a finished answer, which is exactly why they work across so many situations.",
  " Together they cover a workflow end to end, but each prompt also stands on its own.",
];

const CLOSERS = [
  (m: string) => ` Paste any of them into ${m} and shape the output to match your voice.`,
  (m: string) => ` They run in ${m} and most other assistants — no special setup or account required.`,
  (m: string) => ` Use them in ${m}; the [bracketed] placeholders show you exactly what to swap in.`,
  (m: string) => ` Drop one into ${m}, then ask for tweaks until it fits — shorter, sharper, or a different angle.`,
];

const AUDIENCE_POOL = [
  (s: Subject) => `${s.label} teams that want results without learning prompt engineering`,
  (s: Subject) => `Freelancers and solo operators working with ${s.phrase}`,
  () => `Beginners who want a proven starting point instead of a blank prompt box`,
  () => `Busy people who'd rather edit a solid draft than write one from scratch`,
  (s: Subject) => `Anyone experimenting with AI for ${s.phrase}`,
  () => `Small teams standardizing how they use AI day to day`,
];

const TIPS_POOL = [
  "Replace every [bracketed] placeholder before you run a prompt — the more specific your inputs, the better the output.",
  "If the first result isn't right, don't rewrite the prompt — just reply with what to change (\"make it shorter\", \"more formal\", \"add examples\").",
  "Paste in real context (a URL, your notes, a previous draft) so the model works from your material, not generic assumptions.",
  "Ask the model to give you 3 options, then combine the best parts of each.",
  "Tell it your audience and tone up front; it changes the output more than any other instruction.",
  "Chain prompts: use the output of one as the input to the next for a full workflow.",
  "When you like a result, save your filled-in version as a template for next time.",
  "Ask the model to critique its own answer and improve it before you use it.",
  "Keep a running note of the tweaks that work for you — they become your personal prompt style.",
  "For anything important, verify facts and figures yourself; AI output can sound confident and still be wrong.",
];

/* --------------------------------------------------------------- *
 * Public API
 * --------------------------------------------------------------- */

export function enrichPack(pack: Pack): PackEnrichment {
  const subject = deriveSubject(pack);
  const count = pack.promptCount;
  const models = joinModels(pack.models);
  const firstModel = pack.models[0] || "ChatGPT";
  const firstPrompt = pack.prompts[0]?.title || "the first prompt";

  // Overview — composed from three independently-seeded pools.
  const opener = pick(OPENERS, hash(pack.id, 11))(pack.title, count, subject.phrase);
  const value = pick(VALUES, hash(pack.id, 29));
  const closer = pick(CLOSERS, hash(pack.id, 53))(models);
  const overview = `${opener}${value}${closer}`;

  // Audience — 3 relevant bullets, offset by hash.
  const audience = pickN(AUDIENCE_POOL, 3, hash(pack.id, 71)).map((fn) => fn(subject));

  // How to use — utility steps referencing this pack's specifics.
  const howTo = [
    {
      title: "Pick a prompt",
      text: `Start with “${firstPrompt}”, or scan the ${count} prompts below for the one that matches your task.`,
    },
    {
      title: "Copy it",
      text: `Use the Copy button on any prompt — or “Copy all ${count} prompts” — to grab the full text.`,
    },
    {
      title: "Fill in the blanks",
      text: `Swap the [bracketed] placeholders for your own details before you run it.`,
    },
    {
      title: "Run and refine",
      text: `Paste it into ${firstModel}, then ask for adjustments until the result fits ${subject.phrase}.`,
    },
  ];

  // Tips — 4, offset by hash.
  const tips = pickN(TIPS_POOL, 4, hash(pack.id, 97));

  // FAQ — specific answers (also powers FAQ structured data).
  const licenseNote =
    pack.source?.name && pack.source.name !== "Prompt Platform (original)"
      ? ` They're adapted from ${pack.source.name} (${pack.source.license}).`
      : ` They're original ${SITE_NAME} content.`;

  const faq: PackFaq[] = [
    {
      q: `Is the ${pack.title} free to use?`,
      a: `Yes. All ${count} prompts in this pack are free to read, copy and use — including for commercial work. ${SITE_NAME} is ad-supported, with no account, checkout or paywall.`,
    },
    {
      q: `Which AI models do these prompts work with?`,
      a: `They're model-agnostic and work with ${models} and most other assistants. Copy a prompt and paste it into whichever tool you prefer.`,
    },
    {
      q: `How many prompts are included?`,
      a: `${count} prompts.${licenseNote}`,
    },
    {
      q: `Do I need to know prompt engineering?`,
      a: `No. Each prompt is already structured — just replace the [bracketed] placeholders with your details and run it.`,
    },
  ];
  if (subject.kind === "playbook") {
    faq.push({
      q: `Can I use these prompts for ${subject.label}?`,
      a: `Yes — they're tailored to ${subject.phrase}, and every placeholder can be adapted to your exact ${subject.label} use case.`,
    });
  }

  return { overview, audience, howTo, tips, faq };
}
