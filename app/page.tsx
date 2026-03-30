import Link from "next/link";
import { HomePage } from "@/components/home-page";
import { SiteLogo } from "@/components/site-logo";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-col gap-8 px-5 py-12 md:px-8">
        <header>
          <h1 className="m-0">
            <SiteLogo />
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            URL を貼ってストックする記事アプリ。利用するにはログインが必要です。
          </p>
        </header>
        <Link
          href="/login"
          className="inline-flex w-fit rounded-xl bg-stone-800 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          ログインする
        </Link>
      </div>
    );
  }

  return <HomePage />;
}
