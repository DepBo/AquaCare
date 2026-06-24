-- ── DỌN DẸP HỆ THỐNG CŨ ───────────────────────────────────────────
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS mqtt_messages CASCADE;
DROP TABLE IF EXISTS relay_logs CASCADE;
DROP TABLE IF EXISTS alerts_history CASCADE;
DROP TABLE IF EXISTS telemetry_logs CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS tanks CASCADE;
DROP TABLE IF EXISTS fish_species CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE; -- Xóa bảng profiles cũ
DROP TABLE IF EXISTS users CASCADE;    -- Xóa bảng users (nếu có)

-- ── 1. BẢNG NGƯỜI DÙNG (USERS - Tên mới) ──────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' 
        CHECK (role IN ('user', 'staff', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. BẢNG GÓI CƯỚC DỊCH VỤ (SUBSCRIPTIONS) ──────────────────────
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY, -- Chuyển sang số tự tăng (1, 2, 3...)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL 
        CHECK (plan_type IN ('free', 'premium', 'enterprise')),
    max_tanks INTEGER NOT NULL DEFAULT 3,
    ai_enabled BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'expired', 'cancelled')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ── 3. BẢNG CÁC LOÀI CÁ (FISH_SPECIES) ────────────────────────────
CREATE TABLE fish_species (
    id SERIAL PRIMARY KEY, -- Chuyển sang số tự tăng
    species_name VARCHAR(100) NOT NULL UNIQUE,
    temp_min DECIMAL(5,2),
    temp_max DECIMAL(5,2),
    ph_min DECIMAL(5,2),
    ph_max DECIMAL(5,2),
    tds_min DECIMAL(8,2),
    tds_max DECIMAL(8,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO fish_species (species_name, temp_min, temp_max, ph_min, ph_max, tds_min, tds_max)
VALUES 
('Cá Betta', 24.0, 30.0, 6.5, 7.5, 100.0, 300.0),
('Cá Guppy (7 màu)', 22.0, 28.0, 7.0, 8.0, 200.0, 500.0),
('Cá Koi', 18.0, 26.0, 7.0, 8.5, 150.0, 400.0),
('Cá Rồng', 24.0, 30.0, 6.0, 7.5, 80.0, 250.0),
('Cá Dĩa', 28.0, 31.0, 5.5, 6.8, 50.0, 150.0);

SELECT t.tank_name, s.species_name 
FROM tanks t 
LEFT JOIN fish_species s ON t.species_id = s.id;

-- ── 4. BẢNG BỂ CÁ (TANKS) ────────────────────────────────────────
CREATE TABLE tanks (
    id SERIAL PRIMARY KEY, -- Chuyển sang số tự tăng
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tank_name VARCHAR(100) NOT NULL,
    species_id INTEGER REFERENCES fish_species(id) ON DELETE SET NULL, -- Đồng bộ khóa ngoại thành INTEGER
    water_volume_liter DECIMAL(8,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. BẢNG THIẾT BỊ ESP32 (DEVICES) ──────────────────────────────
CREATE TABLE devices (
    id SERIAL PRIMARY KEY, -- Chuyển sang số tự tăng
    tank_id INTEGER UNIQUE REFERENCES tanks(id) ON DELETE SET NULL, -- Đồng bộ khóa ngoại thành INTEGER
    mac_address VARCHAR(30) UNIQUE NOT NULL,
    firmware_version VARCHAR(30),
    sampling_interval_seconds INTEGER NOT NULL DEFAULT 30
        CHECK (sampling_interval_seconds IN (10, 30, 60, 600)),
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMPTZ,
    
    relay_pump_state BOOLEAN DEFAULT FALSE,
    relay_aerator_state BOOLEAN DEFAULT FALSE,
    relay_light_state BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. BẢNG LỊCH SỬ CẢM BIẾN (TELEMETRY_LOGS) ────────────────────
CREATE TABLE telemetry_logs (
    id BIGSERIAL PRIMARY KEY, -- Giữ nguyên BIGSERIAL cho Data khổng lồ
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    temp DECIMAL(5,2),
    ph DECIMAL(5,2),
    tds DECIMAL(8,2),
    water_level_ok BOOLEAN,
    extra_data JSONB, 
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. BẢNG LỊCH SỬ CẢNH BÁO (ALERTS_HISTORY) ────────────────────
CREATE TABLE alerts_history (
    id BIGSERIAL PRIMARY KEY,
    tank_id INTEGER NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    actual_value DECIMAL(12,4),
    alert_message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. BẢNG LỊCH SỬ ĐIỀU KHIỂN RELAY (RELAY_LOGS) ─────────────────
CREATE TABLE relay_logs (
    id BIGSERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    relay_name VARCHAR(50) NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('ON', 'OFF')),
    triggered_by VARCHAR(20) NOT NULL CHECK (triggered_by IN ('USER', 'AUTO', 'SYSTEM')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. BẢNG TIN NHẮN MQTT THÔ (DEBUG) ─────────────────────────────
CREATE TABLE mqtt_messages (
    id BIGSERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    raw_payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    received_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. BẢNG THÔNG BÁO TRÊN APP (NOTIFICATIONS) ───────────────────
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── HỆ THỐNG INDEXES ──────────────────────────────────────────────
CREATE INDEX idx_tanks_user_id ON tanks(user_id);
CREATE INDEX idx_devices_tank_id ON devices(tank_id);
CREATE INDEX idx_telemetry_device_time ON telemetry_logs(device_id, recorded_at DESC);
CREATE INDEX idx_alerts_history_tank ON alerts_history(tank_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- CẤP LẠI QUYỀN TRUY CẬP (Đề phòng bị khóa như lúc nãy)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;