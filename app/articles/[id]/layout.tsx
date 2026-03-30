import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Props = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function ArticleSectionLayout({ children, params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/articles/${id}`)}`);
  }
  return children;
}
