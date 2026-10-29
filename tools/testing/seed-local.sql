-- Synthetic fixture for the local Supabase container only. Never run on a linked project.
BEGIN;
INSERT INTO public.products (id, name, description, price, image_url, version, is_available, details)
VALUES ('v3-demo', 'AquaCare V3 Demo', 'Dùng thử hệ thống bằng mã MAC simulator, không giao thiết bị vật lý.', 0, '/images/Version3.png', 3, true,
        '["Mã MAC simulator riêng", "Không giao thiết bị vật lý", "Trải nghiệm giám sát và điều khiển"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
  price = EXCLUDED.price, image_url = EXCLUDED.image_url, version = EXCLUDED.version,
  is_available = EXCLUDED.is_available, details = EXCLUDED.details;
INSERT INTO public.products (id, name, description, price, image_url, version, is_available, details)
VALUES
  ('v1', 'AquaCare Starter', 'Sản phẩm thử nghiệm V1 trong Supabase local.', 950000, '/images/Version1.png', 1, true, '[]'::jsonb),
  ('v3', 'AquaCare Advanced', 'Sản phẩm thử nghiệm V3 trong Supabase local.', 3700000, '/images/Version3.png', 3, true, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
  price = EXCLUDED.price, image_url = EXCLUDED.image_url, version = EXCLUDED.version,
  is_available = EXCLUDED.is_available, details = EXCLUDED.details;
INSERT INTO public.devices (mac_address, firmware_version, is_simulator, is_active, tank_id)
VALUES ('QA:00:00:00:00:01', 'V3 Demo', true, false, null)
ON CONFLICT (mac_address) DO UPDATE SET firmware_version = EXCLUDED.firmware_version,
  is_simulator = EXCLUDED.is_simulator, is_active = false, tank_id = null, relay_pump_state = false;
INSERT INTO public.devices (mac_address, firmware_version, is_simulator, is_active, tank_id)
VALUES ('QA:00:00:00:00:02', 'V3', true, false, null)
ON CONFLICT (mac_address) DO UPDATE SET firmware_version = EXCLUDED.firmware_version,
  is_simulator = EXCLUDED.is_simulator, is_active = false, tank_id = null, relay_pump_state = false;
INSERT INTO public.devices (mac_address, firmware_version, is_simulator, is_active, tank_id)
VALUES
  ('QA:00:00:00:00:03', 'V3', true, false, null),
  ('QA:00:00:00:00:04', 'V1', true, false, null)
ON CONFLICT (mac_address) DO UPDATE SET firmware_version = EXCLUDED.firmware_version,
  is_simulator = EXCLUDED.is_simulator, is_active = false, tank_id = null, relay_pump_state = false;
COMMIT;
