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

INSERT INTO devices (mac_address, firmware_version)
VALUES 
('AA:AD:39:8F:DC:9E', 'v1.0.0'),
('BB:C1:42:9A:ED:11', 'v1.0.0'),
('CC:55:88:11:22:33', 'v1.0.1'),
('DD:66:99:22:33:44', 'v1.1.0'),
('EE:77:AA:33:44:55', 'v2.0.0');

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

ALTER PUBLICATION supabase_realtime ADD TABLE telemetry_logs;

-- Cập nhật lại is_active dựa trên việc đã được gán vào bể hay chưa
UPDATE devices 
SET is_active = (tank_id IS NOT NULL);

-- Nếu bạn muốn từ giờ về sau, mặc định thiết bị mới thêm vào là FALSE (đang ở kho)
-- Bạn có thể sửa default value của cột is_active:
ALTER TABLE devices ALTER COLUMN is_active SET DEFAULT FALSE;

ALTER PUBLICATION supabase_realtime ADD TABLE alerts_history;
ALTER PUBLICATION supabase_realtime ADD TABLE devices;
-- Thêm các cột lưu thời gian hẹn giờ (Kiểu TEXT để lưu chuỗi dạng 'HH:MM')
ALTER TABLE public.devices 
ADD COLUMN IF NOT EXISTS pump_on_time TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pump_off_time TEXT DEFAULT NULL,

ADD COLUMN IF NOT EXISTS aerator_on_time TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS aerator_off_time TEXT DEFAULT NULL,

ADD COLUMN IF NOT EXISTS light_on_time TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS light_off_time TEXT DEFAULT NULL;

ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Thêm các trường phục vụ quá trình Calib cho bảng devices
ALTER TABLE public.devices 
ADD COLUMN IF NOT EXISTS calib_ph_status TEXT DEFAULT 'ready' CHECK (calib_ph_status IN ('ready', 'request_7.0', 'request_4.0', 'processing', 'done', 'failed')),
ADD COLUMN IF NOT EXISTS calib_tds_status TEXT DEFAULT 'ready' CHECK (calib_tds_status IN ('ready', 'request_standard', 'processing', 'done', 'failed')),

-- Cột lưu hệ số sai lệch (Offset) sau khi calib xong để app/web hiển thị hoặc debug nếu cần
ADD COLUMN IF NOT EXISTS ph_offset DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tds_calib_factor DECIMAL(5,2) DEFAULT 1.00;

ALTER TABLE public.devices 
-- Thêm cột lưu ngày giờ hiệu chuẩn (calib) gần đây nhất cho từng cảm biến
ADD COLUMN IF NOT EXISTS last_calib_ph TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_calib_tds TIMESTAMPTZ DEFAULT NOW();

-- 1. Thêm cột is_simulator vào bảng devices
-- Mặc định là TRUE (để khi tạo mới hồ cá, nó sẽ mặc định ở chế độ giả lập)
ALTER TABLE public.devices 
ADD COLUMN IF NOT EXISTS is_simulator BOOLEAN DEFAULT TRUE;

INSERT INTO public.devices (
    mac_address, 
    is_simulator, 
    is_active, 
    sampling_interval_seconds
) 
VALUES (
    'A0:B7:65:CD:A8:88', -- MAC của phần cứng V2
    FALSE,               -- is_simulator = FALSE (đây là thiết bị thật)
    TRUE,                -- is_active = TRUE
    30                   -- sampling interval
);

-- BƯỚC 2: Tái cấu trúc hàm trigger handle_new_user() chống bẫy UNIQUE chuỗi rỗng
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER   -- Chạy với quyền tối cao để có thể ghi vào public.users
SET search_path = public
AS $$
DECLARE
    user_phone TEXT;
BEGIN
    -- Kiểm tra số điện thoại từ metadata của Google, nếu không có thì gán NULL tuyệt đối
    user_phone := NEW.raw_user_meta_data->>'phone';
    IF user_phone = '' THEN
        user_phone := NULL;
    END IF;

    INSERT INTO public.users (id, full_name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        NEW.email,
        user_phone,  -- Lưu NULL nếu không có SĐT để không bị lỗi UNIQUE khi có nhiều user Google
        'user'
    )
    -- Đồng bộ cập nhật họ tên nếu user thay đổi thông tin trên Google Account
    ON CONFLICT (id) DO UPDATE 
    SET 
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- BƯỚC 3: Khởi tạo Trigger liên kết hệ thống Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── 1. TẠO BẢNG CẤU HÌNH THÔNG BÁO RIÊNG BIỆT (PROFESSIONAL ARCHITECTURE) ──
CREATE TABLE public.tank_notification_settings (
    tank_id INTEGER PRIMARY KEY REFERENCES public.tanks(id) ON DELETE CASCADE, -- Mỗi bể có 1 bộ cấu hình riêng
    
    -- Các kênh nhận thông báo (Mặc định bật hết)
    notify_via_email BOOLEAN DEFAULT TRUE,
    notify_via_web_push BOOLEAN DEFAULT TRUE,
    notify_via_app_noti BOOLEAN DEFAULT TRUE,
    
    -- Tần suất lặp lại (Cooldown chặn spam - Đơn vị: Phút)
    alert_cooldown_minutes INTEGER DEFAULT 30, -- Giá trị có thể chọn: 15, 30, 60, hoặc 0 nếu tắt lặp
    
    -- Lọc mức độ nghiêm trọng muốn nhận
    -- 'both': Nhận tất cả | 'critical_only': Chỉ nhận Danger | 'warning_only': Chỉ nhận Warn | 'none': Tắt thông báo ra ngoài
    alert_severity_preference VARCHAR(20) DEFAULT 'both' 
        CHECK (alert_severity_preference IN ('both', 'critical_only', 'warning_only', 'none')),
        
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. TẠO CỘT THEO DÕI THỜI GIAN GỬI CẢNH BÁO GẦN NHẤT TRÊN BẢNG TANKS ──
-- Cột này lưu mốc thời gian cuối cùng hệ thống bắn cảnh báo ra ngoài của riêng bể đó
-- Backend Node.js sẽ lấy (Thời gian hiện tại - last_alert_sent_at) để đối chiếu với alert_cooldown_minutes
ALTER TABLE public.tanks
ADD COLUMN IF NOT EXISTS last_alert_sent_at TIMESTAMPTZ DEFAULT NULL;

-- ── 3. TỰ ĐỘNG HÓA (AUTOMATION TRIGGER) ──────────────────────────────────
-- Để hệ thống vận hành chuyên nghiệp hoàn toàn, khi người dùng tạo mới một bể cá (Tanks),
-- Hệ thống phải tự động tạo kèm một dòng cấu hình mặc định trong bảng tank_notification_settings
-- Nhờ vậy Front-end hoặc Backend không bao giờ bị lỗi NuLL dữ liệu cấu hình.

CREATE OR REPLACE FUNCTION public.handle_new_tank_settings()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.tank_notification_settings (tank_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_tank_created ON public.tanks;

CREATE TRIGGER on_tank_created
    AFTER INSERT ON public.tanks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_tank_settings();

-- ── 4. KHỞI TẠO CẤU HÌNH CHO CÁC BỂ CÁ ĐANG CÓ SẴN TRONG HỆ THỐNG ─────────
-- Chạy dòng này để bù đắp cấu hình cho những bể cá bạn đã tạo trước đó
INSERT INTO public.tank_notification_settings (tank_id)
SELECT id FROM public.tanks
ON CONFLICT (tank_id) DO NOTHING;

-- ── 5. CẤP QUYỀN HỆ THỐNG ────────────────────────────────────────────────
GRANT ALL PRIVILEGES ON TABLE public.tank_notification_settings TO postgres, anon, authenticated, service_role;

-------------------------------------------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fcm_token TEXT DEFAULT NULL;

-- Tách ra thành 2 cột riêng biệt: web_fcm_token và app_fcm_token. Backend sẽ gửi song song đến cả 2 token.
ALTER TABLE public.users RENAME COLUMN fcm_token TO web_fcm_token;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS app_fcm_token TEXT DEFAULT NULL;

---- avt
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ── 11. BẢNG DANH MỤC SẢN PHẨM (PRODUCTS) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(20) PRIMARY KEY,          -- 'v1', 'v2', 'v3', 'v4'
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,              -- Đơn vị: VND
    image_url TEXT,
    version INTEGER,                     -- 1, 2, 3, 4
    is_available BOOLEAN DEFAULT TRUE,
    details JSONB,                       -- Mảng string: danh sách tính năng
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ── 12. BẢNG ĐƠN HÀNG (ORDERS) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Thông tin giao hàng (snapshot tại thời điểm đặt)
    shipping_name VARCHAR(200) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    
    -- Trạng thái đơn hàng
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled')),
    
    -- Tổng tiền
    total_price INTEGER NOT NULL,        -- Đơn vị: VND
    
    -- Ghi chú của khách
    note TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ── 13. BẢNG CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(20) NOT NULL REFERENCES public.products(id),
    
    -- Snapshot thông tin sản phẩm tại thời điểm đặt
    product_name VARCHAR(200) NOT NULL,
    product_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)
);
-- ── INDEXES ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
-- ── DỮ LIỆU MẪU: 4 PHIÊN BẢN SẢN PHẨM ───────────────────────────────
INSERT INTO public.products (id, name, description, price, image_url, version, details)
VALUES
('v1', 'AquaCare Starter', 'Giải pháp khởi đầu cho người mới chơi cá.', 890000,
 '/images/Version1.png', 1,
 '["1 Cảm biến: Temperature","1 Relay: Water Pump","Realtime monitoring","Cảnh báo cơ bản","Xem lịch sử dữ liệu","Bật/tắt relay thủ công","Hẹn giờ bật/tắt relay"]'),
('v2', 'AquaCare Basic', 'Bổ sung theo dõi độ pH và mực nước.', 2790000,
 '/images/Version2.png', 2,
 '["3 Cảm biến: Temperature, pH, Water Level","1 Relay: Water Pump","Realtime monitoring","Cảnh báo cơ bản","Xem lịch sử dữ liệu","Bật/tắt relay thủ công","Hẹn giờ bật/tắt relay"]'),
('v3', 'AquaCare Advanced', 'Giám sát toàn diện và điều khiển đa thiết bị.', 3390000,
 '/images/Version3.png', 3,
 '["4 Cảm biến: Temperature, pH, TDS, Water Level","3 Relay: Light, Water Pump, Air Pump","Realtime monitoring","Cảnh báo cơ bản","Xem lịch sử dữ liệu","Bật/tắt relay thủ công","Hẹn giờ bật/tắt relay"]'),
('v4', 'AquaCare Premium', 'Cao cấp nhất với đo điện năng PZEM.', 3990000,
 '/images/Version4.png', 4,
 '["5 Cảm biến: Temperature, pH, TDS, Water Level, PZEM","4 Relay: Light, Water Pump, Air Pump, Fan","Realtime monitoring","Đo điện năng tiêu thụ (PZEM Dashboard)","Cảnh báo cơ bản","Xem lịch sử dữ liệu","Bật/tắt relay thủ công","Hẹn giờ bật/tắt relay"]')
ON CONFLICT (id) DO UPDATE 
SET name=EXCLUDED.name, price=EXCLUDED.price, updated_at=NOW();
-- ── CẤP QUYỀN ─────────────────────────────────────────────────────────
GRANT ALL PRIVILEGES ON TABLE public.products TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.orders TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.order_items TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ── 14. BẢNG GIỎ HÀNG (CART_ITEMS) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id VARCHAR(20) NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id) -- Mỗi user chỉ có tối đa 1 dòng cho mỗi sản phẩm trong giỏ
);

-- Index để truy vấn giỏ hàng của user nhanh hơn
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

-- Cấp quyền truy cập cho client
GRANT ALL PRIVILEGES ON TABLE public.cart_items TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ── 15. CẬP NHẬT BẢNG ĐƠN HÀNG (ORDERS) ─────────────────────────────
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS note TEXT;