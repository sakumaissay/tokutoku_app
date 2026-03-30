import * as cheerio from "cheerio";

export type OgpParsed = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
};

function metaContent($: ReturnType<typeof cheerio.load>, selectors: { prop?: string; name?: string }[]): string | null {
  for (const s of selectors) {
    const sel = s.prop ? `meta[property="${s.prop}"]` : `meta[name="${s.name}"]`;
    const v = $(sel).attr("content")?.trim();
    if (v) return v;
  }
  return null;
}

export function parseOgpFromHtml(html: string, pageUrl: string): OgpParsed {
  const $ = cheerio.load(html);

  const rawTitle =
    metaContent($, [{ prop: "og:title" }, { name: "twitter:title" }]) ??
    $("title").first().text().trim();
  const title = rawTitle ? rawTitle : null;

  const description =
    metaContent($, [
      { prop: "og:description" },
      { name: "description" },
      { name: "twitter:description" },
    ]) ?? null;

  let imageUrl = metaContent($, [{ prop: "og:image" }, { name: "twitter:image" }]) ?? null;
  if (imageUrl) {
    try {
      imageUrl = new URL(imageUrl, pageUrl).href;
    } catch {
      imageUrl = null;
    }
  }

  const siteName = metaContent($, [{ prop: "og:site_name" }]) ?? null;

  return { title, description, imageUrl, siteName };
}
