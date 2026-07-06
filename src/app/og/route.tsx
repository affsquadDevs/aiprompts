import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const runtime = "edge";

// Default branded 1200×630 OpenGraph image, generated on the fly so social
// shares always have a valid preview. Served at /og.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #0f172a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 34, opacity: 0.85, marginBottom: 12 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
          1,000+ Free AI Prompt Packs
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, opacity: 0.92, marginTop: 8 }}>
          ChatGPT · Claude · Gemini · Midjourney
        </div>
        <div style={{ fontSize: 30, opacity: 0.7, marginTop: 28 }}>
          Copy &amp; paste — no account, no paywall
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
