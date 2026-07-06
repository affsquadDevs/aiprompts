import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { SITE_NAME } from "@/lib/seo";

export const runtime = "edge";

// Dynamic 1200×630 OpenGraph image. With no query params it renders the default
// branded card; pass ?title=&eyebrow=&note= for a page-specific card (used by
// pack, category and other detail pages). Served at /og.
export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clip = (s: string | null, n: number) =>
    s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s || "";

  const eyebrow = clip(searchParams.get("eyebrow"), 60) || SITE_NAME;
  const title = clip(searchParams.get("title"), 90) || "1,000+ Free AI Prompt Packs";
  const note =
    clip(searchParams.get("note"), 70) ||
    "ChatGPT · Claude · Gemini · Midjourney — copy & paste, no account";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 55%, #0f172a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg,#a78bfa,#22d3ee)",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              textTransform: "uppercase",
              letterSpacing: 3,
              color: "#c4b5fd",
              marginBottom: 18,
            }}
          >
            {eyebrow}
          </div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>
            {title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              padding: "8px 18px",
              borderRadius: 999,
              background: "#10b981",
              color: "#04231a",
            }}
          >
            FREE
          </div>
          <div style={{ fontSize: 28, opacity: 0.85 }}>{note}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
