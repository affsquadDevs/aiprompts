# PromptsVault

A free, ad-supported library of AI prompt packs for ChatGPT, Claude, Gemini and
Midjourney. Fully static content (no backend, no database, no auth) built with
**Next.js 16** (App Router) and **Tailwind CSS 4**.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Script              | Description                                        |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start the dev server (Turbopack)                   |
| `npm run build`     | Production build (statically generates every page) |
| `npm run start`     | Serve the production build                          |
| `npm run lint`      | ESLint                                             |
| `npm run build:data`| Regenerate `src/data/*` from `data-sources/`       |

## Configuration

Copy `.env.example` to `.env.local` and set the values. The only variable that
**must** be set for production is the canonical domain:

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

This drives canonical URLs, the sitemap, `robots.txt`, OpenGraph/Twitter cards
and JSON-LD. Ads (Google AdSense) are optional — see `.env.example`.

## SEO

The site is built to rank in both classic search and AI answer engines:

- Per-page `<title>`, meta description, canonical URL, OpenGraph & Twitter cards.
- Dynamic social images at `/og` (per-pack cards via query params).
- `sitemap.xml` covering every pack, category and static page.
- `robots.txt` that explicitly welcomes AI crawlers (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, Applebot-Extended, …).
- Rich JSON-LD: `WebSite` + `SearchAction`, `Organization`, `BreadcrumbList`,
  `ItemList`, `CollectionPage`, `FAQPage` and per-pack `CreativeWork`.
- PWA `manifest.webmanifest` and generated app / apple-touch icons.

## Data

The catalog is generated at build time by `scripts/build-data.mjs` from the
public prompt collections in `data-sources/` into `src/data/catalog.json`
(+ a lightweight client index). Cover images are served on-the-fly from
Unsplash's CDN (see `src/lib/cover-image.ts`).

## Deploy

Any Node host that runs `next build` + `next start` works (Vercel, Netlify,
Docker, etc.). Remember to set `NEXT_PUBLIC_SITE_URL` in the host environment.
