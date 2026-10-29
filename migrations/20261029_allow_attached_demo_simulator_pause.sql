create or replace function public.protect_v3_demo_device()
returns trigger language plpgsql set search_path = public as $$
declare
  v_owner uuid;
  v_tank_owner uuid;
begin
  if old.firmware_version is distinct from 'V3 Demo' then
    if tg_op = 'DELETE' then return old; end if;
    if new.firmware_version = 'V3 Demo' then
      if auth.role() <> 'service_role'
        and not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
        raise exception 'Only admin may create V3 Demo stock';
      end if;
      if new.tank_id is not null or new.is_active is true then
        raise exception 'V3 Demo stock must be unassigned';
      end if;
      new.is_simulator := true;
    end if;
    return new;
  end if;
  if tg_op = 'DELETE' and auth.role() <> 'service_role'
    and not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Only admin may delete V3 Demo stock';
  end if;
  if tg_op = 'UPDATE' and auth.role() = 'service_role'
    and new.tank_id is not distinct from old.tank_id
    and new.is_active is not distinct from old.is_active
    and new.mac_address is not distinct from old.mac_address
    and new.firmware_version is not distinct from old.firmware_version then
    return new;
  end if;

  select o.user_id into v_owner
  from public.order_items i join public.orders o on o.id = i.order_id
  where i.product_id = 'v3-demo' and i.device_macs ? old.mac_address
  limit 1;

  if tg_op = 'DELETE' then
    if v_owner is not null then raise exception 'Cannot delete an allocated V3 Demo MAC'; end if;
    return old;
  end if;

  if v_owner is not null then
    if auth.role() <> 'service_role' and auth.uid() is distinct from v_owner
      and not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
      raise exception 'This V3 Demo MAC belongs to another account';
    end if;
    if new.mac_address is distinct from old.mac_address
      or new.firmware_version is distinct from old.firmware_version then
      raise exception 'Cannot change an allocated V3 Demo identity';
    end if;
    -- Keep a purchased MAC reserved when unassigned; allow its attached simulator to pause.
    if new.tank_id is null then new.is_active := true; end if;
    if new.tank_id is distinct from old.tank_id and auth.role() <> 'service_role' then
      if auth.uid() is distinct from v_owner then
        raise exception 'This V3 Demo MAC belongs to another account';
      end if;
      if new.tank_id is not null then
        select t.user_id into v_tank_owner from public.tanks t where t.id = new.tank_id;
        if v_tank_owner is distinct from v_owner then
          raise exception 'The target tank belongs to another account';
        end if;
      end if;
    end if;
  elsif tg_op = 'UPDATE' then
    if new.tank_id is not null then
      raise exception 'Purchase V3 Demo before assigning its MAC to a tank';
    end if;
    if new.is_active is true and auth.role() <> 'service_role' then
      raise exception 'V3 Demo stock is activated only by checkout';
    end if;
    if auth.role() <> 'service_role' and
      (new.is_active is distinct from old.is_active
       or new.mac_address is distinct from old.mac_address
       or new.firmware_version is distinct from old.firmware_version)
      and not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
      raise exception 'Only admin may manage V3 Demo stock';
    end if;
  end if;
  return new;
end;
$$;


