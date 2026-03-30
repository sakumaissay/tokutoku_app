import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tokutoku",
    short_name: "tokutoku",
    description: "URL を貼ってストックする記事アプリ",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: "#f6f3ed",
    background_color: "#f6f3ed",
    icons: [
      {
        src: "/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
