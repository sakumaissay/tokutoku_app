"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const err = searchParams.get("error");
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function signInGoogle() {
    setLoading("google");
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) setMessage(error.message);
    } finally {
      setLoading(null);
    }
  }

  async function signInMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading("email");
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("ログイン用のリンクをメールに送信しました。受信箱を確認してください。");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 rounded-2xl border border-stone-200/90 bg-white/95 p-6 shadow-md dark:border-stone-700/90 dark:bg-stone-900/90">
      <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-50">ログイン</h1>
      {err === "auth" && (
        <p className="text-sm text-red-600 dark:text-red-400">認証に失敗しました。もう一度お試しください。</p>
      )}
      {message && (
        <p className="text-sm text-stone-600 dark:text-stone-300" role="status">
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={() => void signInGoogle()}
        disabled={loading !== null}
        className="w-full rounded-xl bg-stone-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
      >
        {loading === "google" ? "リダイレクト中…" : "Google で続ける"}
      </button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200 dark:border-stone-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-stone-400 dark:bg-stone-900">または</span>
        </div>
      </div>
      <form onSubmit={signInMagicLink} className="space-y-3">
        <label className="block text-sm text-stone-600 dark:text-stone-400">
          メール（マジックリンク）
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2.5 text-stone-800 outline-none focus:border-amber-400/90 dark:border-stone-600 dark:bg-stone-900/70 dark:text-stone-100"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={loading !== null}
          className="w-full rounded-xl border border-stone-300 bg-transparent px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800/50"
        >
          {loading === "email" ? "送信中…" : "メールにリンクを送る"}
        </button>
      </form>
    </div>
  );
}
