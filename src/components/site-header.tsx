"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Library, Search } from "lucide-react";

const NAV = [
  { href: "/packs", label: "Packs" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/packs?q=${encodeURIComponent(query)}` : "/packs");
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="liquid-glass-header mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-[1.35rem] px-3 py-2.5 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Library className="h-4 w-4" />
          </span>
          <span className="hidden min-[400px]:inline">PromptVault</span>
        </Link>

        <form onSubmit={onSearch} className="hidden min-w-0 flex-1 justify-center md:flex">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search free prompt packs…"
              className="w-full rounded-full border border-zinc-200/80 bg-white/70 py-1.5 pl-9 pr-3 text-sm text-zinc-800 outline-none transition focus:border-violet-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:focus:border-violet-500"
            />
          </div>
        </form>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {NAV.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`hidden rounded-full px-2.5 py-1.5 text-sm font-medium transition sm:inline ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-white/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/packs"
            className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-500 sm:hidden"
          >
            <Search className="h-3.5 w-3.5" />
            Browse
          </Link>
        </nav>
      </div>
    </header>
  );
}
