import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeHttpUrl } from "@/lib/url";
import { postArticleBodySchema } from "@/lib/validation/article";
import { articleFromRow, type ArticleRow } from "@/types/article";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/articles]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as ArticleRow[];
    return NextResponse.json({ articles: rows.map(articleFromRow) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[GET /api/articles]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const withUrl =
    typeof raw.url === "string" ? { ...raw, url: normalizeHttpUrl(raw.url) } : raw;

  const parsed = postArticleBodySchema.safeParse(withUrl);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const b = parsed.data;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const insert = {
      user_id: user.id,
      url: b.url,
      title: b.title,
      description: b.description?.trim() || null,
      image_url: b.imageUrl ?? null,
      site_name: b.siteName ?? null,
      note: b.note?.trim() || null,
      status: b.status,
      tags: b.tags ?? [],
    };

    const { data, error } = await supabase.from("articles").insert(insert).select("*").single();

    if (error) {
      console.error("[POST /api/articles]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article: articleFromRow(data as ArticleRow) }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[POST /api/articles]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
