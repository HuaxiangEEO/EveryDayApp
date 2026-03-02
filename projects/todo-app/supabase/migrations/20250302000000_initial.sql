-- 在 Supabase Dashboard -> SQL Editor 中执行此文件，或使用 Supabase CLI: supabase db push
-- 清单表：仅存储 inbox 与自定义清单，all/today/recent7 为前端虚拟视图
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('inbox', 'custom')),
  created_at timestamptz not null default now()
);

create index if not exists lists_user_id_idx on public.lists(user_id);

-- 任务表
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  list_id uuid not null references public.lists(id) on delete cascade,
  title text not null,
  due_date date,
  completed boolean not null default false,
  important boolean not null default false,
  urgent boolean not null default false,
  created_at timestamptz not null default now(),
  "order" int
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_list_id_idx on public.tasks(list_id);

-- RLS
alter table public.lists enable row level security;
alter table public.tasks enable row level security;

create policy "users own lists" on public.lists
  for all using (auth.uid() = user_id);

create policy "users own tasks" on public.tasks
  for all using (auth.uid() = user_id);
