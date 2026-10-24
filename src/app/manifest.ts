import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PFC Event Companion",
    short_name: "PFC",
    description: "Games, schedule, photos, scores, and team chat for the PFC gathering.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F1E7",
    theme_color: "#0B2E5B",
    orientation: "portrait",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
