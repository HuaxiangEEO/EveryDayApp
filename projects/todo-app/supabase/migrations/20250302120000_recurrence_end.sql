-- 重复任务结束条件：一直重复 / 按日期结束 / 按次数结束
alter table public.tasks
  add column if not exists recurrence_end text default 'never',
  add column if not exists recurrence_end_date date,
  add column if not exists recurrence_end_count int;

comment on column public.tasks.recurrence_end is 'never|date|count';
comment on column public.tasks.recurrence_end_date is '按日期结束时的截止日期';
comment on column public.tasks.recurrence_end_count is '按次数结束时的重复次数';
