-- Checkout and fulfil V3 Demo in one transaction. Only the backend service role may call this RPC.
create table if not exists public.demo_fulfillments (
  order_id bigint primary key references public.orders(id) on delete cascade,
  request_key uuid not null unique,
  user_id uuid not null references public.users(id) on delete cascade,
  macs jsonb not null,
  approved_at timestamptz not null default now(),
  packed_at timestamptz not null default now(),
  delivered_at timestamptz not null default now(),
  email_sent_at timestamptz,
  email_attempts integer not null default 0,
  email_claim_until timestamptz,
  email_retry_at timestamptz not null default now(),
  last_email_error text
);

alter table public.demo_fulfillments enable row level security;
revoke all on public.demo_fulfillments from anon, authenticated;
grant select, update on public.demo_fulfillments to service_role;
create index if not exists demo_fulfillments_user_id_idx on public.demo_fulfillments(user_id);
create index if not exists demo_fulfillments_email_retry_idx on public.demo_fulfillments(email_retry_at, order_id)
  where email_sent_at is null;

create or replace function public.checkout_v3_demo(
  p_user_id uuid,
  p_request_key uuid,
  p_quantity integer,
  p_name text,
  p_phone text,
  p_address text,
  p_note text default null
) returns bigint
language plpgsql security definer set search_path = public
as $$
declare
  v_order_id bigint;
  v_product public.products%rowtype;
  v_macs jsonb;
  v_count integer;
  v_now timestamptz := now();
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required';
  end if;
  if p_request_key is null or p_user_id is null or p_quantity is null or p_quantity < 1 or p_quantity > 100
     or nullif(btrim(p_name), '') is null or nullif(btrim(p_phone), '') is null
     or nullif(btrim(p_address), '') is null then
    raise exception 'Invalid demo checkout';
  end if;

  -- Serialise retries of the same request, including concurrent HTTP requests.
  perform pg_advisory_xact_lock(hashtextextended(p_request_key::text, 0));
  select order_id into v_order_id from public.demo_fulfillments where request_key = p_request_key;
  if v_order_id is not null then
    if not exists (select 1 from public.demo_fulfillments where order_id = v_order_id and user_id = p_user_id) then
      raise exception 'Request key belongs to another user';
    end if;
    return v_order_id;
  end if;

  select * into v_product from public.products where id = 'v3-demo' for share;
  if not found or v_product.price <> 0 or v_product.is_available is distinct from true then
    raise exception 'V3 Demo is not available';
  end if;
  if not exists (select 1 from public.users where id = p_user_id and nullif(btrim(email), '') is not null) then
    raise exception 'Account email is required';
  end if;

  -- Lock inventory rows before writing anything. SKIP LOCKED prevents two checkouts using one MAC.
  with selected as (
    select id, mac_address from public.devices
    where firmware_version = 'V3 Demo' and is_active is false and tank_id is null
      and is_simulator is true
    order by id for update skip locked limit p_quantity
  )
  select count(*), coalesce(jsonb_agg(mac_address order by id), '[]'::jsonb)
    into v_count, v_macs from selected;
  if v_count <> p_quantity then
    raise exception 'Not enough V3 Demo MACs in stock';
  end if;

  insert into public.orders (user_id, shipping_name, shipping_phone, shipping_email,
    shipping_address, total_price, note, payment_method, status, created_at, updated_at)
  select p_user_id, btrim(p_name), btrim(p_phone), u.email, btrim(p_address),
    0, nullif(btrim(p_note), ''), 'demo', 'delivered', v_now, v_now
  from public.users u where u.id = p_user_id
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, product_price, quantity, device_macs)
  values (v_order_id, 'v3-demo', v_product.name, 0, p_quantity, v_macs);

  update public.devices set is_active = true, updated_at = v_now
  where mac_address in (select value #>> '{}' from jsonb_array_elements(v_macs));

  insert into public.tasks (task_type, status, customer_id, order_id, title, description, staff_note, completed_at)
  values
    ('packing', 'done', p_user_id, v_order_id, 'Đóng gói đơn V3 Demo #' || v_order_id,
     'Mô phỏng đóng gói; không có thiết bị vật lý.', 'Hệ thống tự động cấp MAC simulator.', v_now),
    ('delivery_install', 'done', p_user_id, v_order_id, 'Giao đơn V3 Demo #' || v_order_id,
     'Mô phỏng giao hàng; không vận chuyển thiết bị vật lý.', 'Hệ thống tự động hoàn tất.', v_now);
  -- The existing BEFORE INSERT trigger can assign real staff. Clear it for simulated tasks.
  update public.tasks set assigned_to = null where order_id = v_order_id and task_type in ('packing', 'delivery_install');

  insert into public.demo_fulfillments (order_id, request_key, user_id, macs,
    approved_at, packed_at, delivered_at)
  values (v_order_id, p_request_key, p_user_id, v_macs, v_now, v_now, v_now);
  return v_order_id;
end;
$$;

create or replace function public.claim_demo_email()
returns table(order_id bigint, user_email text, macs jsonb)
language plpgsql security definer set search_path = public
as $$
declare v_order_id bigint;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required';
  end if;
  select f.order_id into v_order_id from public.demo_fulfillments f
  where f.email_sent_at is null and f.email_retry_at <= now()
    and (f.email_claim_until is null or f.email_claim_until < now())
  order by f.order_id for update skip locked limit 1;
  if v_order_id is null then return; end if;
  update public.demo_fulfillments f set email_claim_until = now() + interval '2 minutes',
    email_attempts = f.email_attempts + 1 where f.order_id = v_order_id;
  return query select f.order_id, u.email::text, f.macs
    from public.demo_fulfillments f join public.users u on u.id = f.user_id
    where f.order_id = v_order_id;
end;
$$;

revoke all on function public.checkout_v3_demo(uuid,uuid,integer,text,text,text,text) from public, anon, authenticated;
grant execute on function public.checkout_v3_demo(uuid,uuid,integer,text,text,text,text) to service_role;
revoke all on function public.claim_demo_email() from public, anon, authenticated;
grant execute on function public.claim_demo_email() to service_role;
