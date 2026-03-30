-- 開発用データは破棄し、user_id + RLS を追加する

truncate table public.articles;

alter table public.articles
  add column user_id uuid not null references auth.users (id) on delete cascade;

drop index if exists articles_created_at_idx;
create index articles_user_created_idx on public.articles (user_id, created_at desc);

alter table public.articles enable row level security;

create policy "articles_select_own"
  on public.articles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "articles_insert_own"
  on public.articles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "articles_update_own"
  on public.articles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "articles_delete_own"
  on public.articles for delete
  to authenticated
  using (auth.uid() = user_id);
