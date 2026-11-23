create table public.user_chart_view_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  first_view_at timestamptz not null default now(),
  source text not null check (source in ('web','app')),
  primary key (user_id, activity_date)
);
alter table public.user_chart_view_days enable row level security;
revoke all on public.user_chart_view_days from anon, authenticated;
grant select on public.user_chart_view_days to authenticated;
grant all on public.user_chart_view_days to service_role;
create policy "Read own chart view days" on public.user_chart_view_days
for select to authenticated using ((select auth.uid()) = user_id);

create function public.record_chart_view(p_source text)
returns date language plpgsql security definer set search_path = '' as $$
declare
  viewer uuid := auth.uid();
  today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  if viewer is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_source is null or p_source not in ('web','app') then raise exception 'Invalid source'; end if;
  insert into public.user_chart_view_days(user_id,activity_date,source)
  values (viewer,today,p_source) on conflict (user_id,activity_date) do nothing;
  return today;
end;
$$;
revoke all on function public.record_chart_view(text) from public,anon;
grant execute on function public.record_chart_view(text) to authenticated;
