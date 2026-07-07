// Deterministic, per-pack editorial enrichment.
//
// Purpose: the catalog contains many packs generated from a small set of
// templates. To keep every page substantial and as UNIQUE as possible, we
// render page-specific editorial content — an overview, how-to, audience, tips
// and an FAQ — assembled from each pack's real attributes (subject, models,
// prompt count, category, and the pack's ACTUAL prompt titles) and seeded by a
// hash of the pack id so pages diverge in structure, not just in nouns.
//
// No runtime randomness → stable SSG output. Note: packs that are siblings of
// the same playbook (same prompt titles, different industry) will still be
// related; the durable fix for that is the content-strategy decision to
// consolidate/prune. This generator maximizes divergence within that constraint.

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
  if (!len) return out;
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

function sentenceList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* --------------------------------------------------------------- *
 * Subject derivation — what the pack is actually about.
 * --------------------------------------------------------------- */

const PLATFORM_NAMES: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  "x-twitter": "X (Twitter)",
  facebook: "Facebook",
  pinterest: "Pinterest",
  threads: "Threads",
};

type Subject = {
  kind: "playbook" | "role" | "platform" | "task" | "curated";
  /** Proper-case label, e.g. "E-commerce", "Copywriters", "X (Twitter)". */
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
    const slug = tags.find((t) => t !== "platform");
    const label = (slug && PLATFORM_NAMES[slug]) || pack.title.split(" ")[0];
    return { kind: "platform", label, phrase: `creators growing on ${label}` };
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

const OPENERS: ((t: string, c: number, s: string) => string)[] = [
  (t, c, s) => `The ${t} gathers ${c} ready-to-run prompts for ${s}.`,
  (t, c, s) => `This pack collects ${c} practical, copy-and-paste prompts made for ${s}.`,
  (t, c, s) => `Inside the ${t} you'll find ${c} prompts built specifically for ${s}.`,
  (t, c, s) => `${t} gives ${s} a focused set of ${c} prompts to work from.`,
  (t, c, s) => `We put together ${c} prompts in the ${t} so ${s} can skip the blank page.`,
  (t, c, s) => `A tight, ${c}-prompt toolkit — the ${t} is built for ${s}.`,
  (t, c, s) => `The ${t} turns a blank chat box into ${c} starting points for ${s}.`,
  (t, c, s) => `Need results fast? The ${t} packs ${c} prompts tuned for ${s}.`,
  (t, c, s) => `From first draft to final polish, the ${t}'s ${c} prompts have ${s} covered.`,
  (t, c, s) => `${c} prompts with one job: helping ${s} move faster with AI. That's the ${t}.`,
];

const HIGHLIGHTS: ((list: string) => string)[] = [
  (list) => ` It includes prompts like ${list}.`,
  (list) => ` Highlights include ${list}.`,
  (list) => ` Among them: ${list}.`,
  (list) => ` You'll get prompts such as ${list}.`,
];

const VALUES = [
  " Each one is written to save you the blank-page problem: open it, add your specifics, and get a strong first draft in seconds.",
  " The structure is already done, so instead of engineering a prompt you just fill in what makes your situation unique.",
  " Every prompt is unlocked and free — copy the whole set, or grab only the one you need right now.",
  " They're meant to be a starting point you edit, not a finished answer, which is exactly why they work across so many situations.",
  " Together they cover a workflow end to end, but each prompt also stands on its own.",
  " Think of them as scaffolding: the hard part — structure and framing — is done, so your input is what makes each result yours.",
  " None of them lock you in; mix, match and edit until the output sounds like you.",
  " They reward specifics — the more real detail you add, the sharper the result.",
];

const CLOSERS: ((m: string) => string)[] = [
  (m) => ` Paste any of them into ${m} and shape the output to match your voice.`,
  (m) => ` They run in ${m} and most other assistants — no special setup or account required.`,
  (m) => ` Use them in ${m}; the [bracketed] placeholders show you exactly what to swap in.`,
  (m) => ` Drop one into ${m}, then ask for tweaks until it fits — shorter, sharper, or a different angle.`,
  (m) => ` Run them in ${m} or any other assistant and iterate from there.`,
  (m) => ` Copy, paste into ${m}, and refine the output in a reply or two.`,
];

// Kind-aware audience pools keep the copy grammatical.
function audiencePool(s: Subject): string[] {
  const shared = [
    "Beginners who want a proven starting point instead of a blank prompt box",
    "Busy people who'd rather edit a solid draft than write one from scratch",
    "Small teams standardizing how they use AI day to day",
  ];
  const byKind: Record<Subject["kind"], string[]> = {
    playbook: [
      `${s.label} founders, marketers and operators`,
      `Teams and freelancers working in ${s.label}`,
      `Anyone using AI to grow ${aOrAn(s.label)} ${s.label.toLowerCase()} business`,
      `In-house and agency marketers serving ${s.label} clients`,
    ],
    role: [
      `${cap(s.phrase)} who want a proven starting point`,
      `Freelance and in-house ${s.phrase}`,
      `New ${s.phrase} who'd rather edit than start from scratch`,
      `Experienced ${s.phrase} looking to move faster`,
    ],
    platform: [
      `Creators and brands growing on ${s.label}`,
      `${s.label} marketers and social media managers`,
      `Anyone building an audience on ${s.label}`,
      `Solo creators who post on ${s.label} regularly`,
    ],
    task: [
      `Anyone who needs to handle ${s.phrase} faster`,
      `People who'd rather start from a solid draft of ${s.phrase}`,
      `Professionals and students working on ${s.phrase}`,
    ],
    curated: [
      `Anyone working on ${s.phrase}`,
      `Freelancers and teams focused on ${s.phrase}`,
      `People who use AI for ${s.phrase} day to day`,
    ],
  };
  return [...byKind[s.kind], ...shared];
}

function aOrAn(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

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
  "Give the model a role and a goal in one line — it sharpens everything that follows.",
  "Paste an example of the style or format you want; showing beats describing.",
  "Break big asks into steps and run them one at a time for more control.",
  "End a prompt with \"ask me any clarifying questions first\" to avoid wrong assumptions.",
  "Set constraints — length, tone, audience — so you don't have to fix them afterward.",
  "Re-run the same prompt with your feedback; the second pass is usually noticeably better.",
];

const STEP1: ((first: string, count: number) => string)[] = [
  (first, count) => `Start with “${first}”, or scan the ${count} prompts below for the one that matches your task.`,
  (first, count) => `Browse the ${count} prompts and pick the closest match — “${first}” is a good place to start.`,
];
const STEP2: ((count: number) => string)[] = [
  (count) => `Use the Copy button on any prompt — or “Copy all ${count} prompts” — to grab the full text.`,
  (count) => `Hit Copy on the prompt you want, or grab the whole set with “Copy all ${count} prompts”.`,
];
const STEP3 = [
  "Swap the [bracketed] placeholders for your own details before you run it.",
  "Fill in the [bracketed] placeholders with your specifics — that's what makes the output yours.",
];
const STEP4: ((model: string, phrase: string) => string)[] = [
  (model, phrase) => `Paste it into ${model}, then ask for adjustments until the result fits ${phrase}.`,
  (model, phrase) => `Drop it into ${model} and refine in a reply or two until it fits ${phrase}.`,
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

  // Overview — composed from four independently-seeded pools, including a
  // sentence that names the pack's actual prompt titles.
  const opener = pick(OPENERS, hash(pack.id, 11))(pack.title, count, subject.phrase);
  const titles = pickN(
    pack.prompts.map((p) => p.title).filter(Boolean),
    3,
    hash(pack.id, 17),
  );
  const highlight = titles.length
    ? pick(HIGHLIGHTS, hash(pack.id, 23))(sentenceList(titles.map((t) => `“${t}”`)))
    : "";
  const value = pick(VALUES, hash(pack.id, 29));
  const closer = pick(CLOSERS, hash(pack.id, 53))(models);
  const overview = `${opener}${highlight}${value}${closer}`;

  // Audience — 3 kind-appropriate, grammatical bullets.
  const audience = pickN(audiencePool(subject), 3, hash(pack.id, 71));

  // How to use — varied steps that reference this pack's specifics.
  const howTo = [
    { title: "Pick a prompt", text: pick(STEP1, hash(pack.id, 31))(firstPrompt, count) },
    { title: "Copy it", text: pick(STEP2, hash(pack.id, 37))(count) },
    { title: "Fill in the blanks", text: pick(STEP3, hash(pack.id, 41)) },
    { title: "Run and refine", text: pick(STEP4, hash(pack.id, 43))(firstModel, subject.phrase) },
  ];

  // Tips — 4 from a wide pool, offset by hash.
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
