-- 任务增加截止时间、周期性重复
alter table public.tasks
  add column if not exists due_time text,
  add column if not exists recurrence text default '';

comment on column public.tasks.due_time is 'HH:mm 格式，可选';
comment on column public.tasks.recurrence is 'daily|weekly|monthly|yearly|weekdays|空字符串表示不重复';
