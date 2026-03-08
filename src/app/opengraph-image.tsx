import { ImageResponse } from "next/og";

export const alt = "NOOK - みんなの部屋をのぞいてみよう";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#2c2825",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo mark */}
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
          <path
            d="M20 28 L20 72 L64 72"
            stroke="#c8c3bd"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M34 48 L34 56 L42 56"
            stroke="#f7f6f4"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Brand name */}
        <div
          style={{
            marginTop: 32,
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "#f7f6f4",
          }}
        >
          NOOK
        </div>
        {/* Tagline */}
        <div
          style={{
            marginTop: 16,
            fontSize: 24,
            color: "#a39e98",
          }}
        >
          みんなの部屋をのぞいてみよう
        </div>
      </div>
    ),
    { ...size }
  );
}
