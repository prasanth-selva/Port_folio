import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Prasanth Selva — Cybersecurity Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #050505 0%, #0a0f1e 60%, #101024 100%)",
          color: "white",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="44" height="44" viewBox="0 0 32 32">
            <path
              d="M16 3l11 4v9c0 7-4.6 11.7-11 14C9.6 27.7 5 23 5 16V7l11-4z"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2"
            />
            <circle cx="16" cy="15" r="3.4" fill="#00F0FF" />
          </svg>
          <span style={{ fontSize: 24, letterSpacing: "0.2em", color: "rgba(255,255,255,0.6)" }}>
            {"PRASANTH.SELVA"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            I break things
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, color: "#00F0FF" }}>
            to secure them.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "rgba(255,255,255,0.55)",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 24,
          }}
        >
          <span>CYBERSECURITY · SOC · WEB SECURITY</span>
          <span>B.E. CSE — CLASS OF 2027</span>
        </div>
      </div>
    ),
    size
  );
}
