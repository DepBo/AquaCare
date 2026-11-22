-- Existing point-in-time alerts keep NULL severity and remain readable.
alter table public.alerts_history
  add column if not exists severity text,
  add column if not exists ended_at timestamptz,
  add column if not exists peak_deviation numeric,
  add column if not exists threshold_snapshot jsonb;

create unique index if not exists hardware_alert_open_metric
  on public.alerts_history (tank_id, device_id, alert_type)
  where severity is not null and ended_at is null;

-- One bounded cursor per device/metric, including healthy readings.
create table if not exists public.hardware_alert_cursors (
  device_id bigint not null references public.devices(id) on delete cascade,
  metric text not null,
  observed_at timestamptz not null,
  primary key (device_id, metric)
);
alter table public.hardware_alert_cursors enable row level security;
revoke all on public.hardware_alert_cursors from public, anon, authenticated;
grant select, insert, update on public.hardware_alert_cursors to service_role;

create or replace function public.record_hardware_alert_sample(
  p_device bigint, p_tank bigint, p_at timestamptz, p_metrics jsonb
) returns text[] language plpgsql security invoker set search_path = '' as $$
declare
  m jsonb;
  label text;
  eligible text[] := '{}';
begin
  for m in select value from jsonb_array_elements(p_metrics) order by value->>'label' loop
    label := m->>'label';
    insert into public.hardware_alert_cursors as c values (p_device, label, p_at)
    on conflict (device_id, metric) do update set observed_at = excluded.observed_at
      where c.observed_at < excluded.observed_at;
    if not found then continue; end if;

    if m->>'severity' is null then
      update public.alerts_history set ended_at = p_at
        where device_id = p_device and tank_id = p_tank and alert_type = label
          and severity is not null and ended_at is null;
    else
      eligible := array_append(eligible, label);
      insert into public.alerts_history as h
        (device_id,tank_id,alert_type,created_at,actual_value,alert_message,severity,peak_deviation,threshold_snapshot)
      values (p_device,p_tank,label,p_at,(m->>'value')::numeric,(m->>'severity') || ' · ' || (m->>'message'),m->>'severity',(m->>'deviation')::numeric,m->'threshold')
      on conflict (tank_id,device_id,alert_type) where severity is not null and ended_at is null
      do update set severity = excluded.severity, peak_deviation = excluded.peak_deviation,
        actual_value = excluded.actual_value, alert_message = excluded.alert_message,
        threshold_snapshot = excluded.threshold_snapshot
      where (excluded.severity = 'Nguy hiểm', excluded.peak_deviation)
          > (h.severity = 'Nguy hiểm', h.peak_deviation);
    end if;
  end loop;
  return eligible;
end;
$$;
revoke all on function public.record_hardware_alert_sample(bigint,bigint,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.record_hardware_alert_sample(bigint,bigint,timestamptz,jsonb) to service_role;
