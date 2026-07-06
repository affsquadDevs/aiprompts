import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// AI / LLM crawlers we explicitly welcome so the catalog can be indexed and
// surfaced by AI answer engines (ChatGPT, Claude, Perplexity, Gemini, etc.).
// The content is free and ad-supported, so broad crawling is desirable.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "GoogleOther",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "DuckAssistBot",
  "YouBot",
  "Diffbot",
  "Timpibot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Everyone (search engines) — full access.
      { userAgent: "*", allow: "/" },
      // Named AI crawlers — full access (explicit opt-in signal).
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
