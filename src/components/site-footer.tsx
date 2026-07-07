import Link from "next/link";
import { getMeta } from "@/data";
import { SITE_NAME } from "@/lib/seo";

/**
 * Site-wide footer, rendered from the root layout so it (and the legally
 * required Privacy / Terms / Contact links) appears on EVERY page — a
 * requirement for AdSense and good UX.
 */
const EXPLORE = [
  { href: "/", label: "Home" },
  { href: "/packs", label: "Packs" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  const meta = getMeta();
  const packCount = new Intl.NumberFormat("en-US").format(meta.packCount);

  return (
    <footer className="mt-10 border-t border-zinc-200/70 bg-white/40 px-4 pt-10 pb-28 dark:border-zinc-800 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {SITE_NAME}
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {SITE_NAME} provides free educational and productivity prompt
              templates. Prompts are sourced from openly-licensed public
              collections (CC0 / MIT) and original playbooks. AI output can be
              inaccurate — always review it before relying on it for important
              work. Nothing here is legal, medical or financial advice.
            </p>
          </div>

          <nav aria-label="Explore" className="text-sm">
            <p className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">
              Explore
            </p>
            <ul className="space-y-2">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-zinc-600 transition hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal" className="text-sm">
            <p className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">
              Legal
            </p>
            <ul className="space-y-2">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-zinc-600 transition hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-8 border-t border-zinc-200/70 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          © 2026 {SITE_NAME} · {packCount} free prompt packs · Ad-supported ·
          Not affiliated with OpenAI, Anthropic, Google or Midjourney
        </p>
      </div>
    </footer>
  );
}
