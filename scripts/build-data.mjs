// Build the static prompt catalog shipped with the frontend.
//
// Reads openly-licensed prompt collections from ../data-sources, normalizes
// them into a single corpus, groups them into themed packs, and additionally
// generates industry "playbook" packs. Emits src/data/catalog.json.
//
// Run: npm run build:data
//
// No network access and no database: the output JSON is the whole backend.

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "data-sources");
const OUT_DIR = join(ROOT, "src", "data");

/* ------------------------------------------------------------------ *
 * Taxonomy
 * ------------------------------------------------------------------ */

const CATEGORIES = [
  { id: "writing", name: "Writing & Content", blurb: "Articles, copy, stories and editing prompts." },
  { id: "marketing", name: "Marketing & Ads", blurb: "Campaigns, ad copy and conversion prompts." },
  { id: "social-media", name: "Social Media", blurb: "Hooks, captions and content calendars." },
  { id: "seo", name: "SEO & Growth", blurb: "Keyword, on-page and content-cluster prompts." },
  { id: "business", name: "Business & Startup", blurb: "Strategy, planning and operations prompts." },
  { id: "sales-support", name: "Sales & Support", blurb: "Outreach, scripts and customer support." },
  { id: "productivity", name: "Productivity & Career", blurb: "Resumes, interviews and personal workflow." },
  { id: "programming", name: "Programming & Dev", blurb: "Code, review, DevOps and architecture." },
  { id: "data", name: "Data & Analytics", blurb: "SQL, spreadsheets and analysis prompts." },
  { id: "design", name: "Design & Image", blurb: "Image, art and creative-direction prompts." },
  { id: "education", name: "Education & Learning", blurb: "Tutors, study plans and explainers." },
  { id: "finance", name: "Finance & Money", blurb: "Budgeting, investing and analysis prompts." },
  { id: "legal", name: "Legal", blurb: "Contracts, clauses and plain-English law." },
  { id: "health", name: "Health & Wellness", blurb: "Fitness, nutrition and mindfulness prompts." },
  { id: "lifestyle", name: "Lifestyle & Travel", blurb: "Planning, hobbies and everyday helpers." },
  { id: "fun", name: "Fun & Roleplay", blurb: "Games, characters and creative roleplay." },
];
const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

// Ordered theme rules. First match wins. `cat` must be a category id.
// `theme` groups prompts into a pack; `title` builds the pack name.
const THEME_RULES = [
  // programming / data
  { re: /\b(sql|database|query|postgres|mysql)\b/i, cat: "data", theme: "sql", title: "SQL & Databases" },
  { re: /\b(excel|spreadsheet|google sheets|formula|pivot)\b/i, cat: "data", theme: "spreadsheets", title: "Spreadsheets & Excel" },
  { re: /\b(data scientist|data analy|analytics|dataset|statistics|visuali[sz])/i, cat: "data", theme: "data-analysis", title: "Data Analysis" },
  { re: /\b(regex|regular expression)\b/i, cat: "programming", theme: "regex", title: "Regex Helpers" },
  { re: /\b(react|vue|angular|frontend|css|tailwind|javascript|typescript)\b/i, cat: "programming", theme: "frontend", title: "Frontend Engineering" },
  { re: /\b(python|java|c\+\+|golang|rust|php|ruby|swift|kotlin|developer|programmer|code review|debug|api|backend|algorithm)\b/i, cat: "programming", theme: "coding", title: "Coding Assistants" },
  { re: /\b(devops|kubernetes|docker|terraform|aws|azure|cloud|ci\/cd|linux|terminal|shell|bash)\b/i, cat: "programming", theme: "devops", title: "DevOps & Cloud" },
  // design / image
  { re: /\b(midjourney|dall-?e|stable diffusion|image prompt|photograph|illustration|logo|art\b|painting|poster|render|3d|blender)\b/i, cat: "design", theme: "image-gen", title: "Image Generation" },
  { re: /\b(ui\/ux|ux|ui design|wireframe|design system|figma)\b/i, cat: "design", theme: "ux", title: "UX & Product Design" },
  // marketing / social / seo
  { re: /\b(seo|keyword|backlink|search engine|serp|meta description)\b/i, cat: "seo", theme: "seo", title: "SEO Toolkit" },
  { re: /\b(ad copy|advertis|google ads|facebook ads|ppc|campaign|growth hack)\b/i, cat: "marketing", theme: "ads", title: "Ads & Campaigns" },
  { re: /\b(email|newsletter|cold email|outreach|drip)\b/i, cat: "marketing", theme: "email", title: "Email Marketing" },
  { re: /\b(instagram|tiktok|youtube|twitter|x\.com|linkedin|reel|shorts|caption|hashtag|social media|influencer)\b/i, cat: "social-media", theme: "social", title: "Social Media" },
  { re: /\b(brand|positioning|slogan|tagline|naming)\b/i, cat: "marketing", theme: "branding", title: "Branding & Naming" },
  { re: /\b(copywrit|landing page|sales page|product description|value proposition)\b/i, cat: "marketing", theme: "copywriting", title: "Copywriting" },
  // sales / support
  { re: /\b(sales|pitch|negotiat|prospect|lead gen|crm|closing)\b/i, cat: "sales-support", theme: "sales", title: "Sales Playbook" },
  { re: /\b(customer (support|service)|help desk|ticket|complaint|faq|chatbot)\b/i, cat: "sales-support", theme: "support", title: "Customer Support" },
  // writing
  { re: /\b(blog|article|essay|content writer|ghostwrit)\b/i, cat: "writing", theme: "blogging", title: "Blogging & Articles" },
  { re: /\b(story|novel|screenwrit|fiction|character|plot|poet|poem|lyric|rapper|songwrit)\b/i, cat: "writing", theme: "creative-writing", title: "Creative Writing" },
  { re: /\b(editor|proofread|grammar|rewrite|paraphrase|summari[sz]|translat)\b/i, cat: "writing", theme: "editing", title: "Editing & Rewriting" },
  { re: /\b(script|video script|podcast|youtube script|voiceover)\b/i, cat: "writing", theme: "scripts", title: "Scripts & Video" },
  // business
  { re: /\b(startup|founder|business plan|pitch deck|investor|venture|saas|product manager|roadmap|okrs?)\b/i, cat: "business", theme: "startup", title: "Startup & Product" },
  { re: /\b(strategy|consult|swot|market research|competitor|business model)\b/i, cat: "business", theme: "strategy", title: "Business Strategy" },
  { re: /\b(project manage|agile|scrum|productivity|workflow|automation|notion)\b/i, cat: "productivity", theme: "productivity", title: "Productivity Systems" },
  // career
  { re: /\b(resume|cv|cover letter|interview|career|job (search|application)|recruit|hr\b|hiring)\b/i, cat: "productivity", theme: "career", title: "Career & Job Search" },
  // education
  { re: /\b(teacher|tutor|lesson|study|exam|student|explain like|learn|course|quiz|flashcard)\b/i, cat: "education", theme: "learning", title: "Learning & Tutoring" },
  { re: /\b(language (teacher|learning)|spoken english|pronunciation|vocabulary)\b/i, cat: "education", theme: "languages", title: "Language Learning" },
  // finance / legal
  { re: /\b(invest|stock|portfolio|trading|crypto|budget|accounting|financ|tax\b|valuation)\b/i, cat: "finance", theme: "finance", title: "Finance & Investing" },
  { re: /\b(legal|lawyer|contract|clause|nda|terms of service|privacy policy|compliance|gdpr)\b/i, cat: "legal", theme: "legal", title: "Legal & Contracts" },
  // health / lifestyle
  { re: /\b(fitness|workout|personal trainer|nutrition|diet|meal plan|yoga|mental health|therapist|meditat|mindful)\b/i, cat: "health", theme: "wellness", title: "Health & Wellness" },
  { re: /\b(travel|trip|itinerary|tour guide|recipe|chef|cook|gardening|home\b)\b/i, cat: "lifestyle", theme: "lifestyle", title: "Lifestyle & Travel" },
  // fun
  { re: /\b(game|dungeon|text adventure|roleplay|tic-tac-toe|chess|trivia|riddle|joke|comedian|fun\b|drunk|emoji)\b/i, cat: "fun", theme: "games", title: "Games & Roleplay" },
];

// Folder-name hints from md sources -> category id
const FOLDER_CAT = {
  creative: "writing",
  writing: "writing",
  finance: "finance",
  legal: "legal",
  marketing: "marketing",
  sales: "sales-support",
  medical: "health",
  programming: "programming",
  meta: "productivity",
  miscellaneous: "productivity",
  entertainment: "fun",
  education: "education",
  business: "business",
  productivity: "productivity",
  games: "fun",
  health: "health",
};

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "item";
}

function cleanText(s) {
  return String(s).replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function titleCaseFromFile(name) {
  return name
    .replace(/\.md$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// Minimal RFC-ish CSV parser (quotes, embedded newlines, doubled quotes).
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inq = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inq) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inq = false;
      } else field += ch;
    } else if (ch === '"') inq = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch === "\r") { /* skip */ }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function detectMedium(text, type) {
  const t = (type || "").toUpperCase();
  if (t === "IMAGE") return "image";
  const s = text.toLowerCase();
  if (/\b(midjourney|dall-?e|stable diffusion|photograph|illustration|render|poster)\b/.test(s)) return "image";
  if (/\b(video|reel|tiktok|youtube script|sora|runway|cinematic|storyboard)\b/.test(s)) return "video";
  if (/\b(audio|music|voice|podcast|song|lyric)\b/.test(s)) return "audio";
  if (/\b(3d|blender|mesh|unity|unreal)\b/.test(s)) return "3d";
  return "text";
}

function modelsFor(medium, catId) {
  if (medium === "image") return ["Midjourney", "DALL·E", "Stable Diffusion"];
  if (medium === "video") return ["Sora", "Runway", "Veo"];
  if (medium === "audio") return ["Suno", "ElevenLabs"];
  const base = ["ChatGPT", "Claude", "Gemini"];
  if (catId === "programming" || catId === "data") base.push("Copilot");
  return base;
}

function classify(text) {
  for (const rule of THEME_RULES) {
    if (rule.re.test(text)) return rule;
  }
  return null;
}

// Pick the most-common source object across a set of corpus items.
function dominantSource(items) {
  const by = new Map();
  for (const it of items) {
    const e = by.get(it.source.name) || { src: it.source, n: 0 };
    e.n++;
    by.set(it.source.name, e);
  }
  return [...by.values()].sort((a, b) => b.n - a.n)[0].src;
}

/* ------------------------------------------------------------------ *
 * 1. Ingest the openly-licensed corpus
 * ------------------------------------------------------------------ */

/** @type {Array<{title:string,content:string,catId:string,theme:string,themeTitle:string,medium:string,tags:string[],source:object}>} */
const corpus = [];
const seen = new Set();

function pushPrompt({ title, content, catHint, type, source }) {
  const cleanTitle = cleanText(title).slice(0, 90);
  const body = cleanText(content);
  if (!cleanTitle || body.length < 40) return;
  const key = body.slice(0, 160).toLowerCase().replace(/\s+/g, " ");
  if (seen.has(key)) return;
  seen.add(key);

  const bag = `${cleanTitle} ${body}`;
  const rule = classify(bag);
  let catId = rule?.cat || (catHint && FOLDER_CAT[catHint]) || "writing";
  if (!CATEGORY_IDS.has(catId)) catId = "writing";
  const theme = rule?.theme || (catHint && FOLDER_CAT[catHint]) || catId;
  const themeTitle = rule?.title || CATEGORIES.find((c) => c.id === catId).name;
  const medium = detectMedium(bag, type);

  const tags = new Set();
  for (const w of ["chatgpt", "claude", "gemini", "midjourney", "seo", "email", "resume", "python",
    "react", "sql", "marketing", "startup", "writing", "interview", "story"]) {
    if (new RegExp(`\\b${w}\\b`, "i").test(bag)) tags.add(w);
  }

  corpus.push({ title: cleanTitle, content: body, catId, theme, themeTitle, medium, tags: [...tags], source });
}

// 1a. awesome-chatgpt-prompts (CC0)
{
  const rows = parseCsv(readFileSync(join(SRC, "awesome-chatgpt-prompts.csv"), "utf8"));
  const head = rows[0];
  const ai = head.indexOf("act"), pi = head.indexOf("prompt"), ti = head.indexOf("type");
  const source = { name: "awesome-chatgpt-prompts", url: "https://github.com/f/awesome-chatgpt-prompts", license: "CC0-1.0" };
  for (let r = 1; r < rows.length; r++) {
    const rec = rows[r];
    if (!rec || rec.length <= pi || !rec[ai] || !rec[pi]) continue;
    pushPrompt({ title: rec[ai], content: rec[pi], type: rec[ti], source });
  }
}

// 1b. LLM-Prompt-Library (MIT) — folder = category
{
  const base = join(SRC, "llm-prompt-library");
  const source = { name: "LLM-Prompt-Library", url: "https://github.com/abilzerian/LLM-Prompt-Library", license: "MIT" };
  for (const file of walk(base)) {
    if (!file.endsWith(".md")) continue;
    const fname = file.split("/").pop();
    if (/^(readme|index|contributing|agents)\.md$/i.test(fname)) continue;
    const catHint = file.split("/").slice(-2, -1)[0];
    const raw = readFileSync(file, "utf8");
    const m = raw.match(/^#\s+(.+)$/m);
    const title = m ? m[1] : titleCaseFromFile(fname);
    const content = raw.replace(/^#\s+.+$/m, "").trim();
    pushPrompt({ title, content, catHint, source });
  }
}

// 1c. ChatGPT-System-Prompts (MIT) — folder = category, "## System Message" body
{
  const base = join(SRC, "chatgpt-system-prompts");
  const source = { name: "ChatGPT-System-Prompts", url: "https://github.com/mustvlad/ChatGPT-System-Prompts", license: "MIT" };
  for (const file of walk(base)) {
    if (!file.endsWith(".md")) continue;
    const fname = file.split("/").pop();
    if (/^(readme|contributing)\.md$/i.test(fname)) continue;
    const catHint = file.split("/").slice(-2, -1)[0];
    const raw = readFileSync(file, "utf8");
    const m = raw.match(/^#\s+(.+)$/m);
    const title = m ? m[1] : titleCaseFromFile(fname);
    let content = raw;
    const sys = raw.split(/##\s*System Message/i)[1];
    if (sys) content = sys.trim();
    else content = raw.replace(/^#\s+.+$/m, "").trim();
    pushPrompt({ title, content, catHint, source });
  }
}

console.log(`Corpus: ${corpus.length} unique real prompts`);

/* ------------------------------------------------------------------ *
 * 2. Build themed packs from the real corpus
 * ------------------------------------------------------------------ */

const packs = [];
const usedSlugs = new Set();

function uniqueSlug(base) {
  let s = slugify(base), n = 2;
  while (usedSlugs.has(s)) s = `${slugify(base)}-${n++}`;
  usedSlugs.add(s);
  return s;
}

const PACK_SUBTITLES = [
  "Hand-picked prompts you can copy and run today",
  "A focused toolkit for faster, better output",
  "Battle-tested prompts, organized and ready",
  "Copy, tweak, and ship in minutes",
  "Everything you need in one collection",
];

// Group corpus by (catId, theme)
const groups = new Map();
for (const p of corpus) {
  const k = `${p.catId}::${p.theme}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(p);
}

let subIdx = 0;
function makePack({ title, catId, prompts, tags, baseSlug, descriptionLead, source }) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  const mediumCounts = {};
  for (const p of prompts) mediumCounts[p.medium] = (mediumCounts[p.medium] || 0) + 1;
  const medium = Object.entries(mediumCounts).sort((a, b) => b[1] - a[1])[0][0];
  const allTags = new Set(tags || []);
  for (const p of prompts) for (const t of (p.tags || [])) allTags.add(t);
  const slug = uniqueSlug(baseSlug || title);
  const lead = descriptionLead ||
    `${title} — ${prompts.length} ready-to-use prompts for ${cat.name.toLowerCase()}. ` +
    `Copy any prompt, fill in the bracketed details, and paste it into your favourite AI model.`;
  packs.push({
    id: slug,
    title,
    subtitle: PACK_SUBTITLES[subIdx++ % PACK_SUBTITLES.length],
    description: lead,
    categoryId: catId,
    categoryName: cat.name,
    medium,
    models: modelsFor(medium, catId),
    tags: [...allTags].slice(0, 8),
    popularity: 0,
    source: source || null,
    prompts: prompts.map((p, i) => ({
      id: `${slug}-${i + 1}`,
      title: p.title,
      content: p.content,
    })),
  });
}

const TARGET_PER_PACK = 9;
const MIN_PER_PACK = 4;

for (const [key, items] of groups) {
  const [catId, theme] = key.split("::");
  const themeTitle = items[0].themeTitle;
  // primary source attribution = most common
  const srcCount = {};
  for (const it of items) srcCount[it.source.name] = (srcCount[it.source.name] || 0) + 1;
  if (items.length < MIN_PER_PACK) {
    // merge tiny themes into a category "essentials" group handled below
    items.forEach((it) => { it._orphan = true; });
    continue;
  }
  // chunk into volumes
  const chunks = [];
  for (let i = 0; i < items.length; i += TARGET_PER_PACK) chunks.push(items.slice(i, i + TARGET_PER_PACK));
  // avoid a tiny trailing chunk
  if (chunks.length > 1 && chunks[chunks.length - 1].length < MIN_PER_PACK) {
    const tail = chunks.pop();
    chunks[chunks.length - 1].push(...tail);
  }
  chunks.forEach((chunk, idx) => {
    const title = chunks.length > 1 ? `${themeTitle} — Vol. ${idx + 1}` : themeTitle;
    makePack({
      title,
      catId,
      prompts: chunk,
      baseSlug: chunks.length > 1 ? `${theme}-vol-${idx + 1}` : theme,
      source: dominantSource(chunk),
    });
  });
}

// orphans -> per-category "Essentials" packs
const orphansByCat = new Map();
for (const p of corpus) {
  if (!p._orphan) continue;
  if (!orphansByCat.has(p.catId)) orphansByCat.set(p.catId, []);
  orphansByCat.get(p.catId).push(p);
}
for (const [catId, items] of orphansByCat) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  for (let i = 0; i < items.length; i += TARGET_PER_PACK) {
    const chunk = items.slice(i, i + TARGET_PER_PACK);
    if (chunk.length < MIN_PER_PACK && packs.length) continue;
    const n = Math.floor(i / TARGET_PER_PACK) + 1;
    makePack({
      title: i === 0 ? `${cat.name} Essentials` : `${cat.name} Essentials — Vol. ${n}`,
      catId,
      prompts: chunk,
      baseSlug: i === 0 ? `${catId}-essentials` : `${catId}-essentials-vol-${n}`,
      source: dominantSource(chunk),
    });
  }
}

const realPackCount = packs.length;
console.log(`Real-corpus packs: ${realPackCount}`);

/* ------------------------------------------------------------------ *
 * 3. Generate industry "playbook" packs (original content)
 * ------------------------------------------------------------------ */

const INDUSTRIES = [
  ["SaaS", "a B2B SaaS product"], ["E-commerce", "an online store"], ["Real Estate", "a real estate agency"],
  ["Healthcare", "a healthcare clinic"], ["Fintech", "a fintech app"], ["Online Education", "an online course business"],
  ["Travel & Hospitality", "a travel & hospitality brand"], ["Fitness & Wellness", "a fitness studio"],
  ["Restaurant & Food", "a restaurant"], ["Fashion & Beauty", "a fashion & beauty brand"],
  ["Automotive", "an automotive dealership"], ["Legal Services", "a law firm"],
  ["Marketing Agency", "a marketing agency"], ["Nonprofit", "a nonprofit organization"],
  ["Gaming", "a video-game studio"], ["Crypto & Web3", "a web3 startup"],
  ["B2B Manufacturing", "a manufacturing company"], ["Logistics", "a logistics company"],
  ["Insurance", "an insurance provider"], ["HR & Recruiting", "an HR & recruiting team"],
  ["Coaching & Consulting", "a coaching business"], ["Photography", "a photography studio"],
  ["Home Services", "a home-services business"], ["Pet Care", "a pet-care brand"],
  ["Beauty & Cosmetics", "a cosmetics brand"], ["Agriculture", "an agriculture business"],
  ["Renewable Energy", "a clean-energy company"], ["Media & Publishing", "a media company"],
  ["Events", "an events company"], ["Telecom", "a telecom provider"],
  ["Dental Practice", "a dental clinic"], ["Veterinary", "a veterinary clinic"],
  ["Childcare", "a childcare center"], ["Senior Care", "a senior-care provider"],
  ["Mental Health Services", "a mental-health practice"], ["Architecture", "an architecture firm"],
  ["Interior Design", "an interior-design studio"], ["Cleaning Services", "a cleaning company"],
  ["Catering", "a catering business"], ["Craft Brewery", "a craft brewery"],
  ["Subscription Box", "a subscription-box brand"], ["Cybersecurity", "a cybersecurity firm"],
  ["EdTech", "an edtech startup"], ["HealthTech", "a healthtech startup"],
  ["Dropshipping", "a dropshipping store"], ["Print on Demand", "a print-on-demand brand"],
  ["Solar Installer", "a solar-installation company"], ["Yoga Studio", "a yoga studio"],
];

// A playbook = { id, title, catId, medium, build(industry)->[{title,content}] }
function P(title, audience, goal) { return { title, audience, goal }; }

const PLAYBOOKS = [
  {
    id: "content-calendar", catId: "social-media", title: "30-Day Content Calendar",
    build: (label, biz) => contentCalendar(label, biz),
  },
  {
    id: "ad-campaign", catId: "marketing", title: "Paid Ads Campaign Kit",
    build: (label, biz) => adCampaign(label, biz),
  },
  {
    id: "email-sequence", catId: "marketing", title: "Email Marketing Sequences",
    build: (label, biz) => emailSequence(label, biz),
  },
  {
    id: "seo-cluster", catId: "seo", title: "SEO Content Cluster",
    build: (label, biz) => seoCluster(label, biz),
  },
  {
    id: "sales-scripts", catId: "sales-support", title: "Sales Outreach Scripts",
    build: (label, biz) => salesScripts(label, biz),
  },
  {
    id: "landing-page", catId: "marketing", title: "High-Converting Landing Page",
    build: (label, biz) => landingPage(label, biz),
  },
  {
    id: "brand-voice", catId: "writing", title: "Brand Voice & Messaging",
    build: (label, biz) => brandVoice(label, biz),
  },
  {
    id: "customer-support", catId: "sales-support", title: "Customer Support Toolkit",
    build: (label, biz) => supportKit(label, biz),
  },
  {
    id: "product-launch", catId: "business", title: "Product Launch Plan",
    build: (label, biz) => productLaunch(label, biz),
  },
  {
    id: "social-hooks", catId: "social-media", title: "Viral Hooks & Captions",
    build: (label, biz) => socialHooks(label, biz),
  },
  {
    id: "blog-pack", catId: "writing", title: "Blog Content Engine",
    build: (label, biz) => blogPack(label, biz),
  },
  {
    id: "market-research", catId: "business", title: "Market & Competitor Research",
    build: (label, biz) => marketResearch(label, biz),
  },
  {
    id: "video-scripts", catId: "social-media", title: "Short-Form Video Scripts",
    build: (label, biz) => videoScripts(label, biz),
  },
  {
    id: "newsletter", catId: "marketing", title: "Newsletter Playbook",
    build: (label, biz) => newsletter(label, biz),
  },
  {
    id: "automation", catId: "productivity", title: "AI Workflow Automation",
    build: (label, biz) => automation(label, biz),
  },
  { id: "code-review", catId: "programming", title: "Code Review & Refactor Kit", build: (l, b) => codeReview(l, b) },
  { id: "api-design", catId: "programming", title: "API & Backend Prompts", build: (l, b) => apiDesign(l, b) },
  { id: "data-analytics", catId: "data", title: "Data Analytics Toolkit", build: (l, b) => dataAnalytics(l, b) },
  { id: "course-creation", catId: "education", title: "Course Creation Kit", build: (l, b) => courseCreation(l, b) },
  { id: "tutoring", catId: "education", title: "Tutor & Study Pack", build: (l, b) => tutoring(l, b) },
  { id: "finance-ops", catId: "finance", title: "Finance & Budgeting Pack", build: (l, b) => financeOps(l, b) },
  { id: "contracts", catId: "legal", title: "Contracts & Policies Pack", build: (l, b) => contracts(l, b) },
  { id: "wellness", catId: "health", title: "Workplace Wellness Pack", build: (l, b) => wellness(l, b) },
  { id: "image-prompts", catId: "design", title: "Brand Image Prompt Pack", build: (l, b) => imagePrompts(l, b) },
  { id: "hiring", catId: "productivity", title: "Hiring & HR Pack", build: (l, b) => hiring(l, b) },
  { id: "retention", catId: "sales-support", title: "Retention & Loyalty Pack", build: (l, b) => retention(l, b) },
  { id: "pr-press", catId: "marketing", title: "PR & Press Kit", build: (l, b) => prPress(l, b) },
  { id: "webinar", catId: "business", title: "Webinar & Event Kit", build: (l, b) => webinar(l, b) },
  { id: "lead-funnel", catId: "marketing", title: "Lead Funnel & Magnet Kit", build: (l, b) => leadFunnel(l, b) },
  { id: "analytics-report", catId: "data", title: "Analytics & Reporting Kit", build: (l, b) => analyticsReport(l, b) },
  { id: "partnerships", catId: "marketing", title: "Partnerships & Influencer Kit", build: (l, b) => partnerships(l, b) },
  { id: "internal-comms", catId: "productivity", title: "Internal Comms & Ops Kit", build: (l, b) => internalComms(l, b) },
];

function prPress(label, biz) {
  return [
    ["Press release", `Act as a PR lead for ${biz} (${label}). Write a press release announcing [news], with a strong headline, dateline, quote, boilerplate, and contact block.`],
    ["Media pitch", `Write 3 concise journalist pitch emails for ${biz} about [story angle] relevant to the ${label} beat.`],
    ["Newsworthy angles", `Brainstorm 8 newsworthy angles ${biz} could pitch to press in the ${label} space, each with the hook and target outlet type.`],
    ["Founder Q&A", `Write a media-ready Q&A with ${biz}'s founder for a ${label} publication, anticipating tough questions.`],
    ["Crisis statement", `Draft a calm, accountable holding statement ${biz} could issue if [issue] happened, for ${label} stakeholders.`],
    ["Award submission", `Write an award-submission narrative for ${biz} in a ${label} category, highlighting impact and proof.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function webinar(label, biz) {
  return [
    ["Webinar plan", `Act as an event marketer for ${biz} (${label}). Plan a webinar on [topic]: title, promise, agenda, audience, and a promo timeline.`],
    ["Registration page", `Write a high-converting webinar registration page for ${biz} targeting ${label} attendees, with benefits and FAQ.`],
    ["Promo emails", `Write a 4-email webinar promotion sequence for ${biz} (invite, value, reminder, last-call) for ${label} subscribers.`],
    ["Slide outline", `Create a slide-by-slide outline for ${biz}'s webinar on [topic], ending with a soft offer for ${label} attendees.`],
    ["Follow-up sequence", `Write a 3-email post-webinar follow-up for ${biz} (replay, recap, offer) segmented by attended vs no-show.`],
    ["Q&A prep", `List 12 likely audience questions for ${biz}'s ${label} webinar and crisp answers.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function leadFunnel(label, biz) {
  return [
    ["Funnel map", `Act as a funnel strategist for ${biz} (${label}). Map a lead-gen funnel from ad to sale: stages, offers, and the metric for each step.`],
    ["Lead magnet", `Propose 6 lead-magnet ideas for ${biz} that ${label} customers would trade their email for, and outline the best one.`],
    ["Opt-in copy", `Write opt-in headline, bullets, and button copy for ${biz}'s lead magnet aimed at ${label} buyers.`],
    ["Tripwire offer", `Design a low-ticket tripwire offer for ${biz} to convert ${label} leads into buyers, with the pitch.`],
    ["Nurture sequence", `Write a 5-email nurture sequence that warms ${label} leads toward ${biz}'s [core offer].`],
    ["Thank-you page", `Write a thank-you / next-step page for ${biz} that moves ${label} leads to the next action.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function analyticsReport(label, biz) {
  return [
    ["Reporting framework", `Act as an analytics lead for ${biz} (${label}). Define a weekly reporting framework: metrics, segments, and the decisions each metric informs.`],
    ["Metric definitions", `Write clear definitions and formulas for the 10 core metrics ${biz} should track in ${label}.`],
    ["Insight narrative", `Turn these numbers into an insight-led narrative for ${biz} leadership: [paste data]. Lead with the so-what.`],
    ["Dashboard spec", `Spec a dashboard for ${biz}'s ${label} team: tiles, charts, filters, and refresh cadence.`],
    ["Anomaly triage", `Given a sudden change in [metric] for ${biz}, list the likely causes ranked by probability and how to confirm each.`],
    ["A/B test plan", `Design an A/B test for ${biz} to improve [metric] with ${label} users: hypothesis, variants, sample size, and success criteria.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function partnerships(label, biz) {
  return [
    ["Partner shortlist", `Act as a partnerships lead for ${biz} (${label}). Identify 10 ideal partner / influencer types and why each fits.`],
    ["Outreach DMs", `Write 3 partnership outreach messages for ${biz} to ${label} creators, leading with mutual value.`],
    ["Collab brief", `Write a creator collaboration brief for ${biz} in ${label}: goals, deliverables, dos/don'ts, and disclosure.`],
    ["Affiliate program", `Design an affiliate / referral program for ${biz} that motivates ${label} partners, with commission ideas.`],
    ["Co-marketing plan", `Plan a co-marketing campaign between ${biz} and a complementary ${label} brand, with assets and split.`],
    ["Performance review", `Create a simple scorecard ${biz} can use to evaluate ${label} partnership ROI.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function internalComms(label, biz) {
  return [
    ["All-hands update", `Act as a comms partner for ${biz} (${label}). Write a clear, motivating all-hands update covering wins, focus, and asks.`],
    ["Policy announcement", `Write an internal announcement for ${biz} about [change], addressing the why and the impact for ${label} staff.`],
    ["Meeting agenda", `Write a tight agenda and pre-read for ${biz}'s [recurring meeting], with timeboxes and desired outcomes.`],
    ["Decision doc", `Draft a one-page decision document for ${biz} on [decision]: context, options, recommendation, and risks.`],
    ["Onboarding note", `Write a warm first-week welcome note and checklist for new ${biz} hires in ${label}.`],
    ["Status template", `Create a reusable weekly status-update template for ${biz} teams (done, doing, blockers, metrics).`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function codeReview(label, biz) {
  return [
    ["Thorough code review", `You are a staff engineer at ${biz} (${label}). Review the following code for bugs, security issues, readability, and performance. Explain each issue, its severity, and the fix. Code:\n[paste code]`],
    ["Refactor for clarity", `Refactor this ${biz} code to be cleaner and more maintainable without changing behaviour. Explain the key changes. Code:\n[paste code]`],
    ["Write tests", `Write thorough unit tests (happy path + edge cases) for this function used in ${biz}'s ${label} system: [paste function].`],
    ["Explain this code", `Explain what this code does, step by step, in plain English for a junior dev at ${biz}: [paste code].`],
    ["Bug hunt", `Act as a debugger for ${biz}. Given this error and code, list the most likely causes ranked by probability and the exact fix for each. Error: [paste]. Code: [paste].`],
    ["PR description", `Write a clear pull-request description for this ${biz} change, including summary, motivation, and testing notes: [paste diff].`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function apiDesign(label, biz) {
  return [
    ["REST API design", `Design a REST API for ${biz}'s [feature] used in the ${label} domain. List endpoints, methods, request/response schemas, status codes, and auth approach.`],
    ["Database schema", `Design a normalized database schema for ${biz} to support [feature]. Provide tables, columns, types, relationships, and indexes.`],
    ["Error handling plan", `Propose a consistent error-handling and logging strategy for ${biz}'s backend serving ${label} customers.`],
    ["API docs", `Write developer documentation for this ${biz} endpoint, with examples and edge cases: [paste endpoint].`],
    ["Performance review", `Suggest 8 ways to improve the performance and scalability of ${biz}'s backend for ${label} traffic spikes.`],
    ["Integration spec", `Write an integration spec for connecting ${biz} with [third-party service], including auth, data flow, and failure handling.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function dataAnalytics(label, biz) {
  return [
    ["SQL from a question", `Act as a data analyst for ${biz} (${label}). Given this schema [paste schema], write SQL to answer: [business question]. Explain the query.`],
    ["Spreadsheet formulas", `Write the spreadsheet formulas ${biz} needs to [calculate metric] from columns [describe columns], and explain each.`],
    ["KPI dashboard plan", `Design a KPI dashboard for ${biz} in ${label}: which metrics, how they're calculated, and what decisions each drives.`],
    ["Analyze a dataset", `You are analyzing ${biz}'s [dataset]. Summarize the key trends, anomalies, and 3 actionable insights for a ${label} business.`],
    ["Cohort/retention analysis", `Outline how ${biz} should run a cohort and retention analysis for ${label} customers, including the metrics and SQL approach.`],
    ["Report narrative", `Turn these numbers into a clear narrative for ${biz} leadership in ${label}: [paste metrics]. Lead with the takeaway.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function courseCreation(label, biz) {
  return [
    ["Course outline", `Act as an instructional designer for ${biz} (${label}). Create a full course outline on [topic]: modules, lessons, learning outcomes, and a project.`],
    ["Lesson script", `Write a clear lesson script for ${biz}'s course teaching [concept] to ${label} learners, with examples and a quick exercise.`],
    ["Quiz builder", `Write a 10-question quiz (mixed formats) with answers to test understanding of [topic] for ${biz} learners.`],
    ["Worksheet", `Create a practical worksheet/exercise for ${biz} students applying [concept] in a ${label} context.`],
    ["Course promo", `Write the sales page copy and 3 launch emails for ${biz}'s new course on [topic] for ${label} audiences.`],
    ["Curriculum path", `Design a beginner-to-advanced learning path for ${label} professionals offered by ${biz}, with milestones.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function tutoring(label, biz) {
  return [
    ["Personal tutor", `Act as a patient tutor for ${biz}'s ${label} learners. Teach me [topic] from scratch, check my understanding after each step, and adapt to my answers.`],
    ["Explain simply", `Explain [concept] for ${label} beginners as if I'm 12, then again at a professional level, with one analogy each.`],
    ["Study plan", `Build a 4-week study plan to master [topic] for a busy ${label} professional, with daily tasks and checkpoints.`],
    ["Practice problems", `Generate 10 practice problems on [topic] with worked solutions, increasing in difficulty.`],
    ["Flashcards", `Create 20 spaced-repetition flashcards (Q/A) for [topic] relevant to ${label}.`],
    ["Feynman check", `Quiz me on [topic] using the Feynman technique and point out gaps in my explanation.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function financeOps(label, biz) {
  return [
    ["Budget builder", `Act as a finance advisor for ${biz} (${label}). Build a monthly operating budget template with categories, assumptions, and a break-even calculation.`],
    ["Cashflow forecast", `Create a 12-month cashflow forecast framework for ${biz} in ${label}, listing inputs and how to model seasonality.`],
    ["Pricing model", `Propose 3 pricing models for ${biz}'s [offer] and the math behind margins for ${label} customers.`],
    ["Investor update", `Write a concise monthly investor update for ${biz}, covering metrics, wins, risks, and asks.`],
    ["Expense audit", `List 12 ways ${biz} could reduce costs in ${label} without hurting growth, ranked by impact.`],
    ["Financial summary", `Turn these ${biz} financials into a plain-English summary for non-finance stakeholders: [paste numbers].`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function contracts(label, biz) {
  return [
    ["Plain-English contract", `Act as a contracts assistant for ${biz} (${label}). Draft a plain-English [contract type] between ${biz} and [counterparty], covering scope, payment, IP, and termination. Note: not legal advice; have a lawyer review.`],
    ["Clause explainer", `Explain this contract clause in plain English and flag any risks for ${biz}: [paste clause].`],
    ["Privacy policy", `Draft a privacy policy outline for ${biz}'s ${label} website covering data collected, usage, and user rights.`],
    ["Terms of service", `Draft terms-of-service sections for ${biz} serving ${label} customers, in clear language.`],
    ["NDA", `Draft a mutual NDA template for ${biz} to use with ${label} partners, with blanks for the key terms.`],
    ["Negotiation points", `List the top 8 terms ${biz} should negotiate in a [contract type] for the ${label} industry, and why.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function wellness(label, biz) {
  return [
    ["Employee wellness plan", `Act as a wellness coach for ${biz} (${label}). Design a 4-week employee wellness program covering movement, nutrition, sleep, and stress, with low-effort daily actions.`],
    ["Burnout check-in", `Write a manager's check-in script and 8 questions to spot and prevent burnout on a ${label} team at ${biz}.`],
    ["Healthy habits", `Create a habit-building plan for busy ${label} professionals, with tiny habits and weekly progress checks.`],
    ["Meal & energy guide", `Write a simple energy-focused meal and hydration guide for ${label} workers, with shopping list.`],
    ["Mindfulness scripts", `Write 5 short (2-minute) mindfulness/breathing scripts ${biz} can share with its ${label} team.`],
    ["Work-life balance", `Suggest 10 practical work-life balance policies ${biz} could adopt for ${label} staff.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function imagePrompts(label, biz) {
  return [
    ["Hero image prompt", `Write a detailed Midjourney/DALL·E prompt for a hero image for ${biz} (${label}): subject, style, lighting, composition, color palette, mood, and aspect ratio.`],
    ["Product shots", `Write 5 image-generation prompts for clean product/marketing shots for ${biz} in the ${label} niche, varying angle and background.`],
    ["Social graphics", `Write 6 image prompts for on-brand social graphics for ${biz}, each with style and text-space guidance for ${label} posts.`],
    ["Logo concepts", `Write 5 logo-concept image prompts for ${biz} (${label}), describing symbolism, style, and palette.`],
    ["Illustration set", `Write prompts for a cohesive illustration set for ${biz}'s ${label} website (consistent style, colors, line weight).`],
    ["Ad creative", `Write 4 image prompts for scroll-stopping ad creatives for ${biz} targeting ${label} customers.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function hiring(label, biz) {
  return [
    ["Job description", `Act as a recruiter for ${biz} (${label}). Write an inclusive, compelling job description for a [role], with responsibilities, must-haves, and nice-to-haves.`],
    ["Interview questions", `Create a structured interview kit for a [role] at ${biz}: 12 questions across skills, behaviour, and culture, with what a great answer looks like.`],
    ["Screening rubric", `Build a scoring rubric to evaluate ${label} candidates for [role] fairly and consistently at ${biz}.`],
    ["Outreach to candidates", `Write 3 personalized recruiting outreach messages for ${biz} to attract ${label} talent for [role].`],
    ["Onboarding plan", `Design a 30-60-90 day onboarding plan for a new [role] at ${biz} in the ${label} industry.`],
    ["Offer & rejection", `Write a warm offer email and a respectful rejection email for ${biz} candidates.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}
function retention(label, biz) {
  return [
    ["Retention plan", `Act as a retention strategist for ${biz} (${label}). Build a plan to reduce churn for [offer], covering onboarding, value moments, and at-risk signals.`],
    ["Loyalty program", `Design a loyalty/rewards program for ${biz} that fits ${label} customers, with tiers and perks.`],
    ["Win-back campaign", `Write a win-back campaign (email + offer) for churned ${label} customers of ${biz}.`],
    ["Onboarding flow", `Design a customer onboarding flow for ${biz} that gets ${label} users to their first win fast.`],
    ["NPS follow-ups", `Write follow-up messages for ${biz} based on NPS score (promoters, passives, detractors) among ${label} customers.`],
    ["Referral program", `Create a referral program and the invite copy for ${biz} to turn happy ${label} customers into advocates.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

// ---- playbook prompt builders (return [{title, content}]) ----

const fill = "Replace the [bracketed] parts with your own details before running the prompt.";

function contentCalendar(label, biz) {
  return [
    ["Month-long posting plan", `You are a senior social media strategist for ${biz} in the ${label} space. Build a 30-day content calendar. For each day include: the platform, content pillar, hook, caption, a call to action, and 5 relevant hashtags. Balance educational, entertaining, and promotional posts at a 3:1:1 ratio. Target audience: [describe audience]. Brand tone: [tone]. Output as a table.`],
    ["Weekly theme planner", `Act as a content director for ${biz}. Propose 4 weekly themes for the ${label} industry that ladder up to the goal of [business goal]. For each week give the theme, 3 post ideas, and 1 reusable content format. Keep it specific to ${label} customers.`],
    ["Repurposing matrix", `For ${biz}, take one pillar piece of content about [topic] and turn it into 10 derivative posts across Instagram, LinkedIn, TikTok, X, and an email. Specify the format and the angle for each. Audience: ${label} buyers.`],
    ["Engagement question bank", `Generate 25 engagement questions a ${label} brand (${biz}) can post to spark comments. Group them by funnel stage (awareness, consideration, loyalty).`],
    ["Trend-jacking ideas", `List 10 current content formats and trends in ${label} that ${biz} could ride this month. For each, explain the trend, a safe brand angle, and a sample caption.`],
    ["Holiday & event hooks", `Build a 12-month list of holidays, awareness days, and seasonal moments relevant to ${label} customers. For each, give ${biz} one post idea and one promo idea.`],
    ["Carousel outline", `Write a 8-slide Instagram/LinkedIn carousel for ${biz} teaching [skill or insight] to ${label} customers. Slide 1 = scroll-stopping hook. Last slide = CTA. Give slide-by-slide copy.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function adCampaign(label, biz) {
  return [
    ["Full-funnel ad plan", `You are a paid media buyer for ${biz} (${label}). Design a full-funnel paid ads plan across Meta and Google with a [monthly budget]. Define audiences, offers, and creative angles for TOFU/MOFU/BOFU. Include expected KPIs and a testing roadmap.`],
    ["Facebook/Instagram ad set", `Write 5 Meta ad variations for ${biz} targeting ${label} customers who want [outcome]. Each variation: primary text, headline, description, and a distinct angle (pain, desire, social proof, urgency, curiosity).`],
    ["Google Search ads", `Create a Google Search ads kit for ${biz}: 10 keywords, 5 responsive-search-ad headlines, 4 descriptions, and 5 negative keywords for the ${label} niche.`],
    ["Hook & angle brainstorm", `Brainstorm 15 ad hooks for ${biz} selling [product] to ${label} customers. For each, label the emotional driver and the awareness stage it fits.`],
    ["UGC video brief", `Write a 30-second UGC ad script for ${biz} in the ${label} market. Include scene-by-scene shots, on-screen text, voiceover, and a strong CTA.`],
    ["Retargeting copy", `Write 4 retargeting ads for ${biz} aimed at ${label} visitors who didn't convert. Address the top objection and add a risk-reversal.`],
    ["Landing-page match check", `Audit the message match between an ad about [offer] and the landing page for ${biz}. List mismatches and rewrite the hero section to align.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function emailSequence(label, biz) {
  return [
    ["Welcome sequence", `Write a 5-email welcome sequence for new subscribers of ${biz} (${label}). For each email give the goal, subject line, preview text, and full body. Move readers from first touch to first purchase of [offer].`],
    ["Abandoned cart / drop-off", `Write a 3-email recovery sequence for ${biz} when a ${label} customer abandons [action]. Use urgency, social proof, and an objection-buster.`],
    ["Re-engagement", `Write a 3-email win-back sequence for lapsed ${label} customers of ${biz}. Subject lines must earn the open. End with a clear next step.`],
    ["Launch sequence", `Write a 4-email launch sequence for ${biz} promoting [new product] to ${label} subscribers: tease, reveal, proof, last call.`],
    ["Subject-line bank", `Generate 25 high-open subject lines for ${biz} email campaigns in ${label}. Group by curiosity, benefit, urgency, and personal.`],
    ["Newsletter template", `Create a repeatable weekly newsletter template for ${biz} that ${label} readers look forward to. Include sections, a content ratio, and example copy.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function seoCluster(label, biz) {
  return [
    ["Topic cluster map", `Act as an SEO strategist for ${biz} (${label}). Build a topic cluster around the pillar keyword [main keyword]. Give 1 pillar page and 12 supporting article titles with target keywords and search intent.`],
    ["Keyword research", `Generate 30 keyword ideas for ${biz} in ${label}, grouped by funnel stage, with rough intent (informational/commercial/transactional) and a suggested content type for each.`],
    ["Article brief", `Write a complete SEO content brief for the article "[article title]" for ${biz}: target keyword, search intent, suggested H2/H3 outline, FAQs, internal links, and word count.`],
    ["Meta tags", `Write 5 SEO title tags (≤60 chars) and meta descriptions (≤155 chars) for a ${biz} page about [topic] in ${label}.`],
    ["On-page optimizer", `Audit and rewrite the on-page SEO for a ${biz} page targeting [keyword]. Improve title, headings, intro, and add a schema suggestion.`],
    ["FAQ schema", `Generate 10 People-Also-Ask style questions and concise answers for ${biz} about [topic] in ${label}, formatted for FAQ schema.`],
    ["Backlink outreach", `Write a 3-step link-building outreach plan and 2 email templates for ${biz} in the ${label} niche.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function salesScripts(label, biz) {
  return [
    ["Cold email", `Write 3 cold email variations for ${biz} selling [offer] to ${label} decision-makers. Keep them under 120 words, lead with relevance, and end with a soft CTA.`],
    ["Cold call opener", `Write a cold-call opener and a 6-line discovery script for ${biz} reps calling ${label} prospects. Include 3 objection responses.`],
    ["LinkedIn outreach", `Write a 4-message LinkedIn outreach sequence for ${biz} targeting ${label} buyers. Connection note + 3 follow-ups, no hard pitch until message 3.`],
    ["Discovery questions", `Generate 15 discovery questions a ${biz} salesperson should ask a ${label} prospect to uncover pain, budget, and timeline.`],
    ["Objection handling", `List the top 8 objections ${label} buyers raise about [offer] and write a confident, non-pushy response to each for ${biz}.`],
    ["Follow-up cadence", `Design a 14-day multi-channel follow-up cadence (email, call, LinkedIn) for ${biz} reps working ${label} leads, with copy for each touch.`],
    ["Proposal builder", `Draft a one-page proposal template ${biz} can send ${label} clients for [project], including scope, outcomes, pricing options, and next steps.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function landingPage(label, biz) {
  return [
    ["Full landing page", `Write a complete high-converting landing page for ${biz} selling [offer] to ${label} customers: hero headline + subhead, 3 benefit blocks, social proof, FAQ, and CTA. Use clear, specific, benefit-driven copy.`],
    ["Hero variations", `Write 6 hero headline + subheadline pairs for ${biz} (${label}), each using a different angle: outcome, pain, curiosity, social proof, speed, and risk-reversal.`],
    ["Benefit bullets", `Turn these features of ${biz}'s [product] into 8 benefit-driven bullets that resonate with ${label} buyers: [list features].`],
    ["Objection FAQ", `Write a 8-question FAQ section for a ${biz} landing page that removes the biggest doubts a ${label} customer has before buying [offer].`],
    ["CTA & guarantee", `Write 5 call-to-action button variations and 2 guarantee statements for ${biz} targeting ${label} customers.`],
    ["Testimonial prompts", `Write 6 questions to ask ${label} customers to collect persuasive testimonials for ${biz}, plus a template to turn answers into a quote.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function brandVoice(label, biz) {
  return [
    ["Brand voice guide", `Create a brand voice and tone guide for ${biz} in the ${label} industry. Define 3 voice traits, do/don't examples, vocabulary, and how the voice shifts across channels.`],
    ["Tagline generator", `Generate 15 taglines and 10 brand-name ideas for ${biz} (${label}), ranging from descriptive to evocative. Explain the best 3.`],
    ["Messaging hierarchy", `Build a messaging hierarchy for ${biz}: one-line positioning, value proposition, 3 pillars, and proof points for ${label} buyers.`],
    ["About page", `Write an authentic, non-generic About page for ${biz} that builds trust with ${label} customers and tells the founding story.`],
    ["Tone rewrite", `Rewrite this paragraph in ${biz}'s brand voice for a ${label} audience, keeping it clear and human: [paste text].`],
    ["Elevator pitches", `Write 3 elevator pitches for ${biz} (10s, 30s, 60s) tailored to ${label} investors, customers, and partners.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function supportKit(label, biz) {
  return [
    ["Macro library", `Write 12 reusable customer-support macros for ${biz} serving ${label} customers, covering refunds, delays, how-to, bugs, and escalations. Keep them warm and on-brand.`],
    ["Tone-perfect replies", `Rewrite this support reply for ${biz} to be empathetic, clear, and solution-first for a frustrated ${label} customer: [paste message].`],
    ["FAQ from tickets", `Turn these common ${label} customer questions into a polished help-center FAQ for ${biz}: [list questions].`],
    ["Escalation flow", `Design an escalation and tone playbook for ${biz} support handling angry ${label} customers, including de-escalation phrases.`],
    ["Chatbot script", `Write a helpful chatbot conversation flow for ${biz} that resolves the top 5 ${label} customer issues before handing off to a human.`],
    ["CSAT follow-up", `Write 3 post-resolution follow-up messages for ${biz} that boost CSAT and invite a review from ${label} customers.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function productLaunch(label, biz) {
  return [
    ["Launch roadmap", `Act as a launch manager for ${biz} (${label}). Build a 6-week go-to-market plan for [new product]: pre-launch, launch week, and post-launch, with channels, assets, and owners.`],
    ["Positioning statement", `Write a positioning statement and 3 differentiators for ${biz}'s [product] versus alternatives in ${label}.`],
    ["Launch announcement", `Write the launch announcement for ${biz}'s [product] as a blog post, an email, and 3 social posts for ${label} audiences.`],
    ["Press / PR angle", `Suggest 5 newsworthy angles and write a short press release for ${biz}'s launch in the ${label} market.`],
    ["Beta feedback survey", `Create a beta feedback survey for ${biz} to validate [product] with ${label} users, mixing rating and open questions.`],
    ["Pricing test", `Propose 3 pricing/packaging options for ${biz}'s [product] for ${label} buyers and an experiment to test them.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function socialHooks(label, biz) {
  return [
    ["Scroll-stopping hooks", `Write 25 scroll-stopping first lines (hooks) for ${biz} content aimed at ${label} audiences. Mix curiosity, bold claim, question, and contrarian.`],
    ["Caption frameworks", `Give 6 reusable caption frameworks (with examples) ${biz} can use for ${label} posts, each with a hook, value, and CTA.`],
    ["Reel/TikTok ideas", `List 20 short-form video ideas for ${biz} in ${label}, each with a hook, the payoff, and an on-screen text suggestion.`],
    ["Carousel hooks", `Write 15 carousel cover lines for ${biz} that make ${label} users swipe, plus the promised payoff for each.`],
    ["Story sequence", `Design a 5-frame Instagram Story sequence for ${biz} to promote [offer] to ${label} followers, ending with a poll or link CTA.`],
    ["Comment-bait posts", `Write 10 post ideas designed to drive comments and saves for ${biz} in the ${label} niche.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function blogPack(label, biz) {
  return [
    ["Article outline", `Act as an editor for ${biz} (${label}). Create a detailed outline for "[article title]" with H2/H3s, key points per section, and a suggested CTA.`],
    ["Full draft", `Write a 1,200-word, genuinely useful blog post for ${biz} about [topic] for a ${label} audience. Be specific, avoid fluff, and include examples and a takeaway box.`],
    ["Listicle generator", `Write a "X ways to [achieve outcome]" listicle for ${biz} targeting ${label} readers, with a punchy intro and scannable items.`],
    ["Intro hooks", `Write 6 different opening paragraphs for a ${biz} article about [topic], each using a different hook style.`],
    ["Repurpose to email", `Turn this ${biz} blog post into a 600-word email and 4 social posts for ${label} subscribers: [paste post].`],
    ["Internal-link plan", `Suggest 8 internal links and anchor texts to add to a ${biz} article about [topic] to strengthen the ${label} topic cluster.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function marketResearch(label, biz) {
  return [
    ["Competitor teardown", `Act as a market analyst for ${biz}. Build a competitor analysis framework for the ${label} market: pick 5 competitors and compare positioning, pricing, strengths, weaknesses, and gaps ${biz} can own.`],
    ["Customer persona", `Create 3 detailed customer personas for ${biz} in ${label}: goals, pains, objections, buying triggers, and where they hang out online.`],
    ["SWOT", `Run a SWOT analysis for ${biz} entering/operating in the ${label} market, with 3 action items per quadrant.`],
    ["Jobs-to-be-done", `List the top 8 jobs-to-be-done a ${label} customer hires ${biz} to do, with the underlying emotional and social motivations.`],
    ["Survey design", `Design a 10-question market-validation survey for ${biz} to test demand for [offer] among ${label} customers.`],
    ["Pricing benchmark", `Outline how ${biz} should benchmark pricing in ${label}, what data to gather, and 3 pricing strategies to consider.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function videoScripts(label, biz) {
  return [
    ["30s explainer", `Write a 30-second short-form video script for ${biz} explaining [offer] to ${label} viewers. Include hook (first 3s), 3 value beats, on-screen text, and CTA.`],
    ["Founder story", `Write a 45-second founder-story video script for ${biz} that builds trust with ${label} audiences.`],
    ["Product demo", `Write a 60-second product-demo script for ${biz}'s [product] for ${label} customers, focusing on the transformation, not features.`],
    ["Testimonial edit", `Turn this raw ${label} customer quote into a 20-second testimonial video script for ${biz} with captions: [paste quote].`],
    ["Trend skit", `Write a short, brand-safe trend-based skit for ${biz} that subtly promotes [offer] to ${label} viewers.`],
    ["YouTube intro", `Write a 15-second YouTube intro and a hook for a ${biz} video titled "[title]" aimed at ${label} viewers.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function newsletter(label, biz) {
  return [
    ["Newsletter strategy", `Design a newsletter strategy for ${biz} (${label}): goal, cadence, sections, content ratio, and a 4-issue starter plan.`],
    ["Issue draft", `Write a full newsletter issue for ${biz} on [topic] for ${label} subscribers, with a personal intro, main story, a quick tip, and a CTA.`],
    ["Subject lines", `Write 20 newsletter subject lines for ${biz} in ${label}, balancing curiosity and clarity.`],
    ["Growth ideas", `List 12 ways ${biz} can grow its newsletter list among ${label} customers, ranked by effort vs. impact.`],
    ["Lead magnet", `Propose 6 lead-magnet ideas for ${biz} to grow a ${label} email list, and write the opt-in copy for the best one.`],
    ["Welcome email", `Write a warm welcome email for new ${biz} subscribers from ${label}, setting expectations and delivering a quick win.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

function automation(label, biz) {
  return [
    ["Workflow audit", `Act as an automation consultant for ${biz} (${label}). Identify 10 repetitive tasks that AI could automate, with the input, the prompt to use, and the time saved for each.`],
    ["SOP writer", `Write a clear standard-operating-procedure for ${biz}'s [recurring task], step by step, that a new ${label} hire could follow.`],
    ["Meeting summarizer", `Write a reusable prompt ${biz} can paste meeting notes into to get decisions, action items, and owners — tuned for ${label} teams.`],
    ["Inbox triage", `Write a prompt that helps ${biz} triage and draft replies to ${label} customer emails by urgency and intent.`],
    ["Report generator", `Create a prompt that turns ${biz}'s raw [weekly metrics] into a clean stakeholder report for ${label} leadership.`],
    ["Prompt template pack", `Write 6 reusable internal prompt templates ${biz} can standardize for its ${label} team (research, drafting, QA, summarizing).`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

// Generate: each playbook × each industry = one pack
const PLAYBOOK_DESC = (pbTitle, label, biz) =>
  `${pbTitle} for ${label}. A ready-to-run set of prompts tailored to ${biz}: copy a prompt, replace the bracketed details, and paste it into ChatGPT, Claude, or Gemini.`;

for (const pb of PLAYBOOKS) {
  for (const [label, biz] of INDUSTRIES) {
    const prompts = pb.build(label, biz);
    makePack({
      title: `${pb.title} for ${label}`,
      catId: pb.catId,
      prompts,
      baseSlug: `${pb.id}-${slugify(label)}`,
      tags: ["playbook", slugify(label)],
      descriptionLead: PLAYBOOK_DESC(pb.title, label, biz),
      source: { name: "Prompt Platform (original)", url: "", license: "Original content" },
    });
  }
}

const playbookPackCount = packs.length - realPackCount;
console.log(`Playbook packs: ${playbookPackCount}`);

/* ------------------------------------------------------------------ *
 * 3b. Role / profession packs (original content)
 * ------------------------------------------------------------------ */

// [role, catId, focus, deliverable, goal, tricky]
const ROLES = [
  ["Copywriter", "writing", "persuasive copy and messaging", "a piece of high-converting copy", "write copy that converts", "a client who keeps rejecting drafts without clear feedback"],
  ["Novelist", "writing", "fiction and storytelling", "a chapter or scene", "finish my novel", "a sagging middle act with no tension"],
  ["Screenwriter", "writing", "screenplays and dialogue", "a scene in screenplay format", "develop my screenplay", "flat dialogue that all sounds the same"],
  ["Journalist", "writing", "reporting and articles", "a well-structured article", "publish a strong story", "verifying a shaky source under deadline"],
  ["Technical Writer", "writing", "clear documentation", "a doc or how-to guide", "document a feature", "explaining a complex system to beginners"],
  ["Translator", "writing", "translation and localization", "a faithful translation", "localize my content", "an idiom that has no direct equivalent"],
  ["Marketing Manager", "marketing", "marketing strategy and campaigns", "a campaign plan", "hit my growth targets", "a campaign that underperformed and a nervous boss"],
  ["Brand Strategist", "marketing", "brand positioning and identity", "a positioning statement", "sharpen my brand", "a brand that blends in with competitors"],
  ["Growth Marketer", "marketing", "acquisition and retention experiments", "an experiment roadmap", "grow my user base", "a channel that stopped scaling"],
  ["Social Media Manager", "social-media", "social content and community", "a week of posts", "grow my audience", "a post that got negative comments"],
  ["YouTuber", "social-media", "video content and audience growth", "a video concept and script", "grow my channel", "a string of videos that flopped"],
  ["Podcaster", "social-media", "podcasting and interviews", "an episode outline", "grow my show", "a guest who gives one-word answers"],
  ["SEO Specialist", "seo", "search optimization", "an SEO plan for a page", "rank higher on Google", "a page that lost rankings after an update"],
  ["Startup Founder", "business", "building and scaling a startup", "a strategy brief", "grow my startup", "deciding what to cut when resources are tight"],
  ["Product Manager", "business", "product strategy and roadmaps", "a PRD or roadmap", "ship the right thing", "saying no to a loud stakeholder"],
  ["Business Consultant", "business", "strategy and operations", "a recommendation memo", "advise a client", "a client resistant to change"],
  ["Project Manager", "productivity", "planning and delivery", "a project plan", "deliver on time", "a project slipping behind schedule"],
  ["Sales Representative", "sales-support", "selling and closing deals", "an outreach sequence", "hit my quota", "a prospect who keeps going dark"],
  ["Account Manager", "sales-support", "client relationships and retention", "a QBR or check-in plan", "keep clients happy", "an unhappy client threatening to churn"],
  ["Customer Support Agent", "sales-support", "support and problem-solving", "a set of reply templates", "resolve tickets faster", "a furious customer demanding a refund"],
  ["Virtual Assistant", "productivity", "admin and coordination", "an organized task plan", "stay on top of everything", "an overloaded inbox and calendar"],
  ["Recruiter", "productivity", "hiring and sourcing", "a job post and interview kit", "hire great people", "a candidate ghosting after an offer"],
  ["HR Manager", "productivity", "people and culture", "an HR policy or comms", "support the team", "a sensitive interpersonal conflict"],
  ["Software Developer", "programming", "writing and shipping code", "a code solution with tests", "build features faster", "a nasty intermittent bug"],
  ["Frontend Developer", "programming", "UI engineering", "a component and styles", "build a clean UI", "a layout that breaks on mobile"],
  ["DevOps Engineer", "programming", "infrastructure and CI/CD", "a pipeline or config", "ship reliably", "a flaky deploy that fails randomly"],
  ["QA Engineer", "programming", "testing and quality", "a test plan and cases", "catch bugs early", "a release with no time to test"],
  ["Data Analyst", "data", "analysis and reporting", "a query and analysis", "answer business questions", "messy data with missing values"],
  ["Data Scientist", "data", "modeling and experiments", "a modeling approach", "ship a useful model", "a model that performs worse in production"],
  ["Graphic Designer", "design", "visual design and branding", "a design brief or concept", "design something on-brand", "vague feedback like 'make it pop'"],
  ["UX Designer", "design", "user experience and flows", "a UX flow or critique", "improve the experience", "stakeholders who skip user research"],
  ["Photographer", "design", "photography and editing", "a shot list and brief", "nail the shoot", "tricky lighting at a venue"],
  ["Teacher", "education", "teaching and lesson design", "a lesson plan", "engage my students", "a class with very mixed skill levels"],
  ["Online Tutor", "education", "one-on-one tutoring", "a tailored study plan", "help my student improve", "a student who lost motivation"],
  ["Course Creator", "education", "designing courses", "a course outline", "launch my course", "a course with high drop-off"],
  ["Student", "education", "studying and learning", "a study schedule", "ace my exams", "procrastination before a big deadline"],
  ["Financial Advisor", "finance", "personal finance and planning", "a financial plan outline", "guide a client's money", "a client who panics during market dips"],
  ["Accountant", "finance", "accounting and bookkeeping", "a reconciliation checklist", "keep the books clean", "a month that won't reconcile"],
  ["Bookkeeper", "finance", "day-to-day bookkeeping", "an expense-tracking setup", "stay organized", "a pile of uncategorized receipts"],
  ["Paralegal", "legal", "legal research and drafting", "a document summary", "support the case", "summarizing a dense contract fast"],
  ["Personal Trainer", "health", "fitness coaching", "a workout program", "get clients results", "a client who skips sessions"],
  ["Nutritionist", "health", "nutrition and meal planning", "a meal plan", "help clients eat better", "a client with very picky preferences"],
  ["Life Coach", "health", "coaching and accountability", "a coaching session plan", "help clients grow", "a client stuck in self-doubt"],
  ["Therapist", "health", "supportive reflection (not medical advice)", "a reflective journaling guide", "support wellbeing", "a heavy session that needs care"],
  ["Travel Blogger", "lifestyle", "travel content and guides", "a destination guide", "grow my travel blog", "writing about an overdone destination freshly"],
  ["Home Cook", "lifestyle", "cooking and recipes", "a recipe and meal idea", "cook better at home", "using up random fridge leftovers"],
  ["Event Planner", "lifestyle", "planning memorable events", "an event plan and checklist", "throw a great event", "a last-minute venue cancellation"],
  ["Real Estate Agent", "lifestyle", "property marketing and sales", "a listing description", "sell more homes", "a listing that's been sitting too long"],
  ["Dungeon Master", "fun", "tabletop roleplay and worldbuilding", "an adventure or NPC", "run an epic session", "players derailing the whole plot"],
  ["Trivia Host", "fun", "quizzes and party games", "a themed quiz round", "host a fun night", "questions that are too easy or too hard"],
  ["Game Designer", "fun", "game mechanics and design", "a game concept or mechanic", "design a fun game", "a mechanic that isn't fun in playtests"],
];

function roleToolkit(role, focus, deliverable, goal, tricky) {
  return [
    [`Act as my ${role}`, `You are a seasoned ${role} with 10+ years of experience in ${focus}. Act as my personal ${role}: ask me what I'm working on, then give specific, senior-level, practical guidance. Be concise and honest.`],
    [`Create ${deliverable}`, `As an expert ${role}, create ${deliverable} for me. First ask for any missing details, then produce a polished, ready-to-use version with a short note on your choices.`],
    [`Review my work`, `As an expert ${role}, review my work on ${focus}. Give blunt, prioritized feedback: what's strong, what's weak, and the top 3 things to fix. My work:\n[paste your work]`],
    [`Brainstorm ideas`, `As a creative ${role}, brainstorm 15 ideas related to ${focus} for [describe my situation]. Group them into themes and flag your top 3 with why.`],
    [`Make me a plan`, `As a ${role}, build me a step-by-step plan to ${goal}. Include milestones, common pitfalls to avoid, and a simple checklist I can follow.`],
    [`Teach me`, `As a patient ${role}, explain ${focus} from beginner to advanced. Use clear examples I can apply today, and check my understanding at the end.`],
    [`Handle a tricky situation`, `As a level-headed ${role}, help me handle this: ${tricky}. Give me a calm, professional approach and the exact words to use. Context: [describe].`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

for (const [role, catId, focus, deliverable, goal, tricky] of ROLES) {
  makePack({
    title: `AI Prompt Toolkit for ${role}s`,
    catId,
    prompts: roleToolkit(role, focus, deliverable, goal, tricky),
    baseSlug: `toolkit-${slugify(role)}`,
    tags: ["role", "toolkit", slugify(role)],
    descriptionLead: `A ready-to-run set of AI prompts built for ${role.toLowerCase()}s. Copy a prompt, add your details, and paste it into ChatGPT, Claude or Gemini to ${goal}.`,
    source: { name: "Prompt Platform (original)", url: "", license: "Original content" },
  });
}
const rolePackCount = packs.length - realPackCount - playbookPackCount;
console.log(`Role packs: ${rolePackCount}`);

/* ------------------------------------------------------------------ *
 * 3c. Platform-specific social packs (original content)
 * ------------------------------------------------------------------ */

const PLATFORMS = [
  ["Instagram", "Reels, carousels and Stories; visual-first; hashtags and saves matter"],
  ["TikTok", "short vertical video; strong 3-second hooks; trends and sounds"],
  ["YouTube", "long-form and Shorts; titles, thumbnails and watch time"],
  ["LinkedIn", "professional audience; text posts and documents; thought leadership"],
  ["X (Twitter)", "short posts and threads; timely takes and replies"],
  ["Facebook", "groups and Pages; community and shareable posts"],
  ["Pinterest", "search-driven pins; idea boards; evergreen visuals"],
  ["Threads", "conversational text posts; casual, fast replies"],
];

const PLATFORM_PLAYBOOKS = [
  ["Growth Playbook", "social-media", (p, h) => [
    [`${p} growth plan`, `Act as a ${p} strategist. Build a 90-day growth plan for [my niche] on ${p}, which favours ${h}. Include posting cadence, content pillars, and growth tactics.`],
    [`Profile audit`, `Audit a ${p} profile for [my niche] and list 10 specific improvements to attract and convert followers.`],
    [`Content pillars`, `Propose 5 content pillars for [my niche] on ${p}, with 3 post ideas each tuned to how ${p} works (${h}).`],
    [`Posting schedule`, `Create a weekly ${p} posting schedule for [my niche], balancing formats that perform on ${p}.`],
    [`Engagement tactics`, `List 12 engagement tactics to grow on ${p} for [my niche], ranked by effort vs. impact.`],
    [`30 post ideas`, `Generate 30 ${p} post ideas for [my niche], each with the format and the hook.`],
  ]],
  ["Content Calendar", "social-media", (p, h) => [
    [`30-day ${p} calendar`, `Build a 30-day ${p} content calendar for [my niche]. For each day: format, hook, caption, and CTA, tuned for ${p} (${h}).`],
    [`Weekly themes`, `Propose 4 weekly themes for [my niche] on ${p} with 3 post ideas each.`],
    [`Repurpose plan`, `Take one idea about [topic] and turn it into 8 ${p}-native posts.`],
    [`Series ideas`, `Suggest 6 repeatable content series for [my niche] on ${p}.`],
    [`Trend angles`, `List 10 current ${p} formats/trends [my niche] can ride, with a brand-safe angle.`],
    [`Caption bank`, `Write 20 ${p} captions for [my niche] across awareness, value, and promo.`],
  ]],
  ["Viral Hooks", "social-media", (p, h) => [
    [`${p} hooks`, `Write 25 scroll-stopping ${p} hooks for [my niche], tuned to ${p} (${h}).`],
    [`Hook formulas`, `Give me 8 reusable ${p} hook formulas with examples for [my niche].`],
    [`Caption frameworks`, `Provide 6 caption frameworks for ${p} posts in [my niche], each with hook, value, CTA.`],
    [`First-line tests`, `Write 15 first lines for a ${p} post about [topic] and rank them by stopping power.`],
    [`CTA bank`, `Write 12 ${p}-appropriate CTAs for [my niche].`],
    [`Comment bait`, `Write 10 ${p} post ideas designed to drive comments and saves for [my niche].`],
  ]],
  ["Ads Kit", "marketing", (p, h) => [
    [`${p} ad plan`, `Act as a ${p} ads buyer. Build an ads plan for [offer] on ${p} (${h}): audiences, angles, budget split, and KPIs.`],
    [`Ad variations`, `Write 5 ${p} ad variations for [offer], each with a distinct angle and ${p}-native format.`],
    [`Creative briefs`, `Write 3 ${p} ad creative briefs (script + visual direction) for [offer].`],
    [`Audience ideas`, `Suggest 8 ${p} audience/targeting ideas for [offer].`],
    [`Hook tests`, `Write 10 ad hooks to test on ${p} for [offer].`],
    [`Retargeting`, `Write 4 ${p} retargeting ads for visitors who didn't convert on [offer].`],
  ]],
  ["Bio & Profile Optimizer", "social-media", (p) => [
    [`${p} bio`, `Write 6 ${p} bio variations for [my niche/brand], each with a clear value prop and CTA.`],
    [`Profile setup`, `Give me a complete ${p} profile setup checklist for [my niche], optimized for discovery.`],
    [`Link strategy`, `Suggest what to put in my ${p} link/link-in-bio for [my goal], with copy.`],
    [`Highlight/board plan`, `Plan my ${p} highlights/boards/pinned content for [my niche].`],
    [`Pinned post`, `Write a pinned ${p} post that introduces [my brand] and drives [action].`],
    [`Name & handle ideas`, `Suggest 10 searchable ${p} name/handle ideas for [my niche].`],
  ]],
  ["Analytics & Reporting", "data", (p) => [
    [`${p} metrics`, `Explain the ${p} metrics that actually matter for [my goal] and how to read them.`],
    [`Weekly report`, `Create a simple weekly ${p} report template for [my niche]: metrics, insights, next actions.`],
    [`What to test`, `Given flat ${p} growth for [my niche], list 8 things to test, ranked.`],
    [`Content audit`, `Outline how to audit my last 30 ${p} posts and what to learn from top vs. bottom performers.`],
    [`Goal setting`, `Help me set realistic 90-day ${p} goals for [my niche] and the leading indicators to track.`],
    [`Benchmark guide`, `Explain how to benchmark my ${p} performance for [my niche] without obsessing over vanity metrics.`],
  ]],
];

for (const [pbTitle, catId, build] of PLATFORM_PLAYBOOKS) {
  for (const [platform, hint] of PLATFORMS) {
    const rows = build(platform, hint);
    makePack({
      title: `${platform} ${pbTitle}`,
      catId,
      prompts: rows.map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` })),
      baseSlug: `${slugify(platform)}-${slugify(pbTitle)}`,
      tags: ["platform", slugify(platform)],
      descriptionLead: `${pbTitle} built for ${platform}. Copy a prompt, add your niche, and run it in ChatGPT, Claude or Gemini to grow on ${platform}.`,
      source: { name: "Prompt Platform (original)", url: "", license: "Original content" },
    });
  }
}
const platformPackCount = packs.length - realPackCount - playbookPackCount - rolePackCount;
console.log(`Platform packs: ${platformPackCount}`);

/* ------------------------------------------------------------------ *
 * 3d. Everyday task packs (original content)
 * ------------------------------------------------------------------ */

// [title, catId, subject, verb]
const TASKS = [
  ["Email Writing", "writing", "an email", "write"],
  ["Cover Letter", "productivity", "a cover letter", "write"],
  ["Resume & CV", "productivity", "a resume", "improve"],
  ["Interview Prep", "productivity", "interview answers", "prepare"],
  ["Salary Negotiation", "productivity", "a salary negotiation", "prepare for"],
  ["Meeting Notes", "productivity", "meeting notes and action items", "organize"],
  ["Time Management", "productivity", "my schedule and priorities", "plan"],
  ["Goal Setting", "productivity", "my goals and habits", "set"],
  ["Decision Making", "business", "a hard decision", "think through"],
  ["Negotiation", "business", "a negotiation", "prepare for"],
  ["Public Speaking", "education", "a speech or talk", "prepare"],
  ["Study Smarter", "education", "a study session", "plan"],
  ["Language Practice", "education", "language practice", "structure"],
  ["Note Taking", "education", "my notes", "organize"],
  ["Summarizing", "writing", "a summary of a long text", "write"],
  ["Proofreading", "writing", "proofreading and editing", "do"],
  ["Storytelling", "writing", "a compelling story", "write"],
  ["Personal Finance", "finance", "my personal budget", "plan"],
  ["Investing Basics", "finance", "an investing plan (educational)", "outline"],
  ["Travel Planning", "lifestyle", "a trip itinerary", "plan"],
  ["Meal Planning", "lifestyle", "a weekly meal plan", "plan"],
  ["Home Organization", "lifestyle", "decluttering my home", "plan"],
  ["Gift Ideas", "lifestyle", "gift ideas", "brainstorm"],
  ["Fitness Plans", "health", "a workout plan", "build"],
  ["Mindfulness", "health", "a mindfulness routine", "build"],
  ["Journaling", "health", "a journaling practice", "start"],
  ["Habit Building", "health", "a new habit", "build"],
  ["Party Games", "fun", "a party game or quiz", "create"],
  ["Creative Writing Prompts", "fun", "creative writing prompts", "generate"],
  ["Roleplay Adventures", "fun", "a roleplay adventure", "run"],
];

function taskPack(subject, verb) {
  return [
    [`Create it for me`, `Help me ${verb} ${subject}. First ask me any clarifying questions, then give me a strong, ready-to-use first version. [your details]`],
    [`Improve mine`, `Improve ${subject}: point out the weak spots and rewrite it better, explaining what you changed. [paste yours]`],
    [`Give me options`, `Give me 15 ideas or options for ${subject}, grouped into themes, with your top 3 picks and why. [context]`],
    [`Make a plan`, `Build me a simple step-by-step plan to ${verb} ${subject}, including a checklist and common mistakes to avoid.`],
    [`I'm stuck`, `I'm stuck with ${subject}. Diagnose what's likely going wrong and suggest concrete fixes. [describe the problem]`],
    [`Reusable templates`, `Give me 5 reusable templates or examples for ${subject} that I can quickly adapt to my situation.`],
  ].map((x) => ({ title: x[0], content: `${x[1]}\n\n${fill}` }));
}

for (const [title, catId, subject, verb] of TASKS) {
  makePack({
    title: `${title} Prompt Pack`,
    catId,
    prompts: taskPack(subject, verb),
    baseSlug: `task-${slugify(title)}`,
    tags: ["everyday", slugify(title)],
    descriptionLead: `A simple, no-jargon set of AI prompts to help with ${subject}. Copy one, add your details, and paste it into ChatGPT, Claude or Gemini.`,
    source: { name: "Prompt Platform (original)", url: "", license: "Original content" },
  });
}
const taskPackCount = packs.length - realPackCount - playbookPackCount - rolePackCount - platformPackCount;
console.log(`Task packs: ${taskPackCount}`);

/* ------------------------------------------------------------------ *
 * 4. Finalize: popularity, counts, write JSON
 * ------------------------------------------------------------------ */

// deterministic pseudo-popularity so "trending" ordering is stable
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
for (const p of packs) {
  p.popularity = 40 + (hashStr(p.id) % 60); // 40..99
  p.promptCount = p.prompts.length;
}
packs.sort((a, b) => b.popularity - a.popularity);

const totalPrompts = packs.reduce((n, p) => n + p.prompts.length, 0);
const catCounts = {};
for (const p of packs) catCounts[p.categoryId] = (catCounts[p.categoryId] || 0) + 1;

const categories = CATEGORIES.map((c) => ({ ...c, slug: c.id, packCount: catCounts[c.id] || 0 }));

const meta = {
  generatedFrom: ["awesome-chatgpt-prompts (CC0)", "LLM-Prompt-Library (MIT)", "ChatGPT-System-Prompts (MIT)", "Prompt Platform playbooks (original)"],
  realPrompts: corpus.length,
  packCount: packs.length,
  promptCount: totalPrompts,
};

// Lightweight index for client-side search/filter (no prompt bodies).
const index = packs.map((p) => ({
  id: p.id,
  title: p.title,
  subtitle: p.subtitle,
  categoryId: p.categoryId,
  categoryName: p.categoryName,
  medium: p.medium,
  models: p.models,
  tags: p.tags,
  promptCount: p.promptCount,
  popularity: p.popularity,
}));

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "catalog.json"), JSON.stringify({ categories, packs, meta }));
writeFileSync(join(OUT_DIR, "index.json"), JSON.stringify({ categories, packs: index, meta }));
writeFileSync(join(OUT_DIR, "meta.json"), JSON.stringify(meta, null, 2));

console.log("\n=== Catalog built ===");
console.log(`Categories : ${categories.length}`);
console.log(`Packs      : ${packs.length}`);
console.log(`Prompts    : ${totalPrompts}`);
console.log(`Real corpus: ${corpus.length}`);
console.log("Per category:", catCounts);
