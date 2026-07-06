import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

// Applies to /packs (list). The /packs/[id] detail route overrides this via its
// own generateMetadata.
export const metadata: Metadata = buildMetadata({
  title: "Browse 1,000+ Free AI Prompt Packs",
  description:
    "Search and filter a free library of AI prompt packs for ChatGPT, Claude, Gemini and Midjourney — marketing, coding, SEO, writing, design and more. No account, no paywall.",
  path: "/packs",
});

export default function PacksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
