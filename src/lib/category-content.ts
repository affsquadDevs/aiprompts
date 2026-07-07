// Hand-authored editorial content for the 16 category landing pages.
//
// Because there are only 16 categories, each gets genuinely unique intro copy
// and example use-cases (rather than templated text). This gives every
// /categories/[id] page substantial, distinct, server-rendered content for both
// search engines and readers.

export type CategoryContent = {
  /** 2–3 sentence intro shown under the H1. */
  intro: string;
  /** Concrete things people use these prompts for. */
  useCases: string[];
};

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  writing: {
    intro:
      "Writing prompts for everything from blog posts and essays to product copy and editing. Whether you're staring at a blank page or polishing a final draft, these packs give you a structured starting point you can shape into your own voice.",
    useCases: [
      "Draft and outline blog articles, essays and newsletters",
      "Rewrite, proofread and tighten existing text",
      "Generate stories, scripts and creative fiction",
      "Summarize long documents into clear takeaways",
    ],
  },
  marketing: {
    intro:
      "Marketing and advertising prompts for campaigns that actually convert. These packs cover the full funnel — ad copy, landing pages, email sequences and positioning — so you can go from idea to launch-ready assets without a blank prompt box.",
    useCases: [
      "Write Meta and Google ad variations with distinct angles",
      "Build high-converting landing pages and email sequences",
      "Sharpen brand messaging, taglines and positioning",
      "Plan full-funnel campaigns with clear KPIs",
    ],
  },
  "social-media": {
    intro:
      "Social media prompts for hooks, captions, content calendars and short-form video. Tuned to how each platform actually works, these packs help you show up consistently and stop the scroll — without running dry on ideas.",
    useCases: [
      "Generate scroll-stopping hooks and caption frameworks",
      "Plan 30-day content calendars per platform",
      "Script Reels, TikToks and YouTube Shorts",
      "Turn one idea into a week of native posts",
    ],
  },
  seo: {
    intro:
      "SEO and growth prompts for keyword research, on-page optimization and content clusters. Use them to plan topic authority, brief writers and tune pages so they rank — with structured output you can hand straight to your team.",
    useCases: [
      "Map topic clusters around a pillar keyword",
      "Write SEO title tags, meta descriptions and briefs",
      "Generate People-Also-Ask questions for FAQ schema",
      "Audit and rewrite on-page content for a target keyword",
    ],
  },
  business: {
    intro:
      "Business and startup prompts for strategy, planning and operations. From market research and competitor teardowns to product launches and investor updates, these packs help founders and operators think clearly and move faster.",
    useCases: [
      "Run SWOT and competitor analyses",
      "Build product launch and go-to-market plans",
      "Draft strategy memos and investor updates",
      "Define customer personas and jobs-to-be-done",
    ],
  },
  "sales-support": {
    intro:
      "Sales and customer-support prompts for outreach, scripts and replies that keep customers happy. Whether you're prospecting, handling objections or de-escalating a tricky ticket, these packs give you the words to use.",
    useCases: [
      "Write cold emails, call openers and follow-up cadences",
      "Handle objections and negotiate with confidence",
      "Build reusable support macros and FAQ answers",
      "De-escalate frustrated customers and win them back",
    ],
  },
  productivity: {
    intro:
      "Productivity and career prompts for the work around the work — resumes, interviews, meeting notes and personal workflows. Use them to get organized, communicate clearly and standardize the tasks you do again and again.",
    useCases: [
      "Improve resumes, cover letters and interview answers",
      "Turn messy notes into decisions and action items",
      "Plan your schedule, goals and habits",
      "Automate repetitive workflows with reusable prompts",
    ],
  },
  programming: {
    intro:
      "Programming and development prompts for writing, reviewing and shipping code. From API design and refactors to test writing and bug hunts, these packs act like a pair-programmer you can prompt for exactly the help you need.",
    useCases: [
      "Review code for bugs, security and performance",
      "Design REST APIs and database schemas",
      "Write unit tests and clear documentation",
      "Debug errors and explain unfamiliar code",
    ],
  },
  data: {
    intro:
      "Data and analytics prompts for SQL, spreadsheets and analysis. Turn business questions into queries, raw numbers into narratives, and dashboards into decisions — with prompts that keep the output structured and explainable.",
    useCases: [
      "Write and explain SQL from a plain-English question",
      "Build spreadsheet formulas and KPI dashboards",
      "Summarize datasets into actionable insights",
      "Plan cohort, retention and A/B-test analyses",
    ],
  },
  design: {
    intro:
      "Design and image prompts for Midjourney, DALL·E and Stable Diffusion, plus UX and creative direction. Use them to write detailed image prompts and brief visual work that stays on-brand.",
    useCases: [
      "Write detailed hero, product and social image prompts",
      "Generate logo concepts and cohesive illustration sets",
      "Brief UX flows and critique existing designs",
      "Create scroll-stopping ad creative directions",
    ],
  },
  education: {
    intro:
      "Education and learning prompts for tutors, study plans and explainers. Whether you're teaching a class, building a course or studying for an exam, these packs adapt to your level and check your understanding as you go.",
    useCases: [
      "Get a patient tutor for any topic, from scratch",
      "Build courses, lesson scripts and quizzes",
      "Create study plans, flashcards and practice problems",
      "Explain hard concepts simply, then at depth",
    ],
  },
  finance: {
    intro:
      "Finance and money prompts for budgeting, investing basics and analysis. Use them to build budgets, model cashflow and turn financials into plain-English summaries — educational scaffolding, not financial advice.",
    useCases: [
      "Build operating budgets and cashflow forecasts",
      "Outline pricing models and margin math",
      "Summarize financials for non-finance stakeholders",
      "Draft clear, concise investor updates",
    ],
  },
  legal: {
    intro:
      "Legal prompts for contracts, clauses and plain-English explanations. Use them to draft first versions and understand dense documents faster — a starting point to bring to a qualified lawyer, not legal advice.",
    useCases: [
      "Draft plain-English contracts, NDAs and policies",
      "Explain contract clauses and flag risks",
      "Outline privacy policies and terms of service",
      "Prepare key negotiation points for a deal",
    ],
  },
  health: {
    intro:
      "Health and wellness prompts for fitness, nutrition and mindfulness routines. Build workout and meal plans, start better habits and add small daily practices — general wellbeing scaffolding, not medical advice.",
    useCases: [
      "Build workout programs and weekly meal plans",
      "Design employee wellness and habit-building plans",
      "Write short mindfulness and breathing scripts",
      "Create burnout check-ins for teams",
    ],
  },
  lifestyle: {
    intro:
      "Lifestyle and travel prompts for planning, hobbies and everyday helpers. From trip itineraries to recipes and home organization, these packs take the friction out of the small projects that fill your week.",
    useCases: [
      "Plan trip itineraries and destination guides",
      "Turn fridge leftovers into recipes and meal ideas",
      "Organize and declutter your home",
      "Brainstorm thoughtful gift ideas",
    ],
  },
  fun: {
    intro:
      "Fun and roleplay prompts for games, characters and creative play. Run tabletop adventures, host quiz nights or spin up a character to chat with — these packs are built to be entertaining first.",
    useCases: [
      "Run tabletop roleplay adventures and NPCs",
      "Host themed trivia and party games",
      "Design game mechanics and concepts",
      "Generate creative-writing and roleplay starters",
    ],
  },
};

/** Fallback for any category id without curated content. */
export function categoryContent(id: string, blurb: string): CategoryContent {
  return (
    CATEGORY_CONTENT[id] ?? {
      intro: blurb,
      useCases: [],
    }
  );
}

/** Per-category FAQ (also powers FAQPage structured data). */
export function categoryFaq(
  categoryName: string,
  packCount: string,
  promptCount: string,
): { q: string; a: string }[] {
  return [
    {
      q: `Are the ${categoryName} prompts free?`,
      a: `Yes — all ${packCount} packs (${promptCount} prompts) in this category are free to read, copy and use, including for commercial work. No account or paywall.`,
    },
    {
      q: `Which AI models do ${categoryName} prompts work with?`,
      a: `They're model-agnostic and work with ChatGPT, Claude, Gemini and most other assistants. Copy a prompt and paste it into your tool of choice.`,
    },
    {
      q: `How do I use these prompts?`,
      a: `Open any pack, copy a prompt, replace the [bracketed] placeholders with your details, and paste it into your AI assistant. Tweak the result until it fits.`,
    },
  ];
}
