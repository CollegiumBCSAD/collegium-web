import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Collegium — Philippine Collegiate Esports Circuit",
    short_name: "Collegium",
    description: "Philippine Collegiate Esports Circuit",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0C10",
    theme_color: "#0A0C10",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
