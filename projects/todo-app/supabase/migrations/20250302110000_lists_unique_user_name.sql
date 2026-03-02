-- 同一用户下清单名称唯一。先把任务引用到保留的清单，再删重复行，最后加约束
-- 保留每个 (user_id, name) 中 created_at 最早的一条
with kept as (
  select distinct on (user_id, name) id, user_id, name
  from public.lists
  order by user_id, name, created_at
)
update public.tasks t
set list_id = k.id
from public.lists l
join kept k on k.user_id = l.user_id and k.name = l.name and k.id != l.id
where t.list_id = l.id;

delete from public.lists a
using public.lists b
where a.user_id = b.user_id and a.name = b.name and a.created_at > b.created_at;

alter table public.lists
  add constraint lists_user_id_name_key unique (user_id, name);
