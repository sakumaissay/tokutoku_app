import { NextResponse } from "next/server";
import { assertSafeHttpUrl } from "@/lib/ogp/ssrf";
import { parseOgpFromHtml } from "@/lib/ogp/parse-html";
import { normalizeHttpUrl } from "@/lib/url";
import { ogpRequestSchema } from "@/lib/validation/article";

export const runtime = "nodejs";

const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 12_000;

async function fetchHtmlWithRedirects(startUrl: string): Promise<
  | { ok: true; html: string; finalUrl: string }
  | { ok: false; message: string }
> {
  let current = startUrl;
  for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
    let safe: URL;
    try {
      safe = assertSafeHttpUrl(current);
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "Bad URL" };
    }

    const res = await fetch(safe.href, {
      redirect: "manual",
      headers: {
        "User-Agent": "tokutoku-mvp/1.0 (+https://github.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { ok: false, message: "Redirect without Location" };
      current = new URL(loc, safe.href).href;
      continue;
    }

    if (!res.ok) {
      return { ok: false, message: `HTTP ${res.status}` };
    }

    const html = await res.text();
    return { ok: true, html, finalUrl: safe.href };
  }

  return { ok: false, message: "Too many redirects" };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const normalized =
    typeof raw.url === "string" ? normalizeHttpUrl(raw.url) : "";
  const parsed = ogpRequestSchema.safeParse({ url: normalized });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { url } = parsed.data;
  const fetched = await fetchHtmlWithRedirects(url);

  if (!fetched.ok) {
    return NextResponse.json({
      ok: true,
      url,
      title: null,
      description: null,
      imageUrl: null,
      siteName: null,
      error: fetched.message,
    });
  }

  const meta = parseOgpFromHtml(fetched.html, fetched.finalUrl);
  return NextResponse.json({
    ok: true,
    url: fetched.finalUrl,
    title: meta.title,
    description: meta.description,
    imageUrl: meta.imageUrl,
    siteName: meta.siteName,
    error: null,
  });
}
