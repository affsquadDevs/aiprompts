import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Branded app icon / favicon: gradient tile with a "P" monogram.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#7c3aed 0%,#4c1d95 50%,#06b6d4 100%)",
          color: "white",
          fontSize: 340,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        P
      </div>
    ),
    { ...size },
  );
}
