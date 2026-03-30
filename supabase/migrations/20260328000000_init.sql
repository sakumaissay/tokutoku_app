-- 単一ユーザー MVP: user_id なし、RLS なし

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text,
  description text,
  image_url text,
  site_name text,
  note text,
  status text not null default 'reading'
    check (status in ('reading', 'thinking', 'stocked')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_created_at_idx on public.articles (created_at desc);

create or replace function public.set_articles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row
  execute function public.set_articles_updated_at();

alter table public.articles disable row level security;
