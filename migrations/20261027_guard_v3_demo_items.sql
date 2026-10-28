-- Prevent the browser's legacy direct checkout path from creating an unfulfilled demo order.
create or replace function public.guard_v3_demo_item_write()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    if old.product_id = 'v3-demo' and auth.role() <> 'service_role' then
      raise exception 'V3 Demo orders are managed by the demo API';
    end if;
    return old;
  end if;
  if (new.product_id = 'v3-demo' or (tg_op = 'UPDATE' and old.product_id = 'v3-demo'))
    and auth.role() <> 'service_role' then
    raise exception 'V3 Demo must be checked out through the demo API';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_v3_demo_item_write on public.order_items;
create trigger guard_v3_demo_item_write
before insert or update or delete on public.order_items
for each row execute function public.guard_v3_demo_item_write();

create or replace function public.guard_v3_demo_order_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() <> 'service_role' and exists (
    select 1 from public.demo_fulfillments where order_id = old.id
  ) then
    raise exception 'V3 Demo orders are managed by the demo API';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists guard_v3_demo_order_write on public.orders;
create trigger guard_v3_demo_order_write before update or delete on public.orders
for each row execute function public.guard_v3_demo_order_write();
