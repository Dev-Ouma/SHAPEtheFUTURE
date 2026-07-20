/**
 * Neutral visual when a staff/leader photo is missing.
 * Never use stock photos of people — that invents a likeness.
 */
export const PROFILE_IMAGE_PLACEHOLDER_CSS =
  "linear-gradient(145deg, #e2e8f0 0%, #cbd5e1 45%, #94a3b8 100%)";

/** 1×1 slate PNG data URI for <img> / next/image when a URL is required. */
export const PROFILE_IMAGE_PLACEHOLDER_DATA_URI =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="45%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#g)"/>
    </svg>`,
  );
