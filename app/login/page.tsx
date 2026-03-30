import Link from "next/link";
import { Suspense } from "react";
import { SiteLogo } from "@/components/site-logo";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-8 px-5 py-12 md:px-8">
      <header>
        <SiteLogo />
        <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
          ログインすると、あなた専用のストックに保存できます。
        </p>
      </header>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-stone-200/80 dark:bg-stone-700/80" />}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-stone-500">
        <Link href="/" className="underline hover:text-stone-800 dark:hover:text-stone-200">
          トップへ戻る
        </Link>
      </p>
    </div>
  );
}
