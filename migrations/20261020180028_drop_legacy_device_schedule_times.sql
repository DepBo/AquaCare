-- Schedules now live in public.device_schedules; execution logs remain in relay_logs.
-- Apply after deploying the web, mobile and timer worker schedule migration.
SET lock_timeout = '5s';
ALTER TABLE public.devices
  DROP COLUMN IF EXISTS pump_on_time RESTRICT,
  DROP COLUMN IF EXISTS pump_off_time RESTRICT,
  DROP COLUMN IF EXISTS light_on_time RESTRICT,
  DROP COLUMN IF EXISTS light_off_time RESTRICT,
  DROP COLUMN IF EXISTS aerator_on_time RESTRICT,
  DROP COLUMN IF EXISTS aerator_off_time RESTRICT;
NOTIFY pgrst, 'reload schema';
