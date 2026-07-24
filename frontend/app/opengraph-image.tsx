import { ImageResponse } from "next/og";

export const alt =
  "SHAPE — Strengthening Higher Education for Smart Cities · Erasmus+";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default social share card for the SHAPE site. Rendered at build/request time
 * by next/og. Used for og:image and twitter:image (see twitter-image.tsx).
 */
export default function OpengraphImage() {
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
            "linear-gradient(135deg, #012f38 0%, #013d48 55%, #025a69 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#ffb08a",
          }}
        >
          Erasmus+ · Co-funded by the European Union
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 200,
              fontWeight: 900,
              letterSpacing: -6,
              lineHeight: 1,
            }}
          >
            SHAPE
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 44,
              fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            Strengthening Higher Education for Smart Cities
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            fontWeight: 700,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          <span style={{ display: "flex" }}>East Africa &amp; Europe · 9 partner universities</span>
          <span style={{ display: "flex", color: "#ff7f50" }}>shape.ouk.ac.ke</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
