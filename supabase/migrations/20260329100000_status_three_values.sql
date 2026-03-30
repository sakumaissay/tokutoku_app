-- 状態を「読む」「考え中」「ストック化」の3つへ（reading / thinking / stocked）

alter table public.articles drop constraint if exists articles_status_check;

update public.articles
set status = 'stocked'
where status in ('inbox', 'done');

alter table public.articles
  add constraint articles_status_check
  check (status in ('reading', 'thinking', 'stocked'));

alter table public.articles alter column status set default 'reading';
