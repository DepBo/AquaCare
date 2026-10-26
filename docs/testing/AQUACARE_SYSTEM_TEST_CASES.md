# AquaCare — Bộ test case hệ thống

Ngày soạn: **24/10/2026**. Cơ sở: mã nguồn trong working tree hiện tại, bao gồm thay đổi relay active-low chưa commit.

**178 test case, 15 nhóm mã nghiệp vụ.** Một test case có thể có nhiều lượt chạy theo nền tảng, role hoặc dữ liệu biên.

**Trạng thái khi soạn: CHƯA CHẠY.** Đây là đặc tả kiểm thử, không phải báo cáo hệ thống đã đạt kiểm thử. Không chạy ứng dụng, API, SQL, MQTT, migration hay điều khiển thiết bị để lập tài liệu này.

Cập nhật24/10/2026: đã chạy90 test tự động hiện có, tất cả Pass. Xem [báo cáo và giới hạn phạm vi](results/2026-10-24/REPORT.md). Các test tự động chỉ kiểm chứng một phần các ca dưới đây; chưa đánh toàn bộ178 ca hệ thống là Pass.

## 1. Phạm vi và cách sử dụng

- Web React, app Flutter, Express backend, Supabase Auth/dữ liệu/Realtime, bộ hẹn giờ, tích hợp MQTT/FCM/email, cấu hình triển khai và cập nhật APK.
- Đã đối chiếu các luồng trong source với tài liệu cũ `TEST_CASES.txt`, `AquaCare_Web/test_case.md` và danh mục test hiện hữu. Tài liệu này dùng các ca có dữ liệu và kết quả cụ thể, không mặc định các dòng checklist cũ là test đã chạy.
- Không tìm thấy source firmware ESP32/STM32 trong các file source được liệt kê của checkout này. `Board master-slave` là thiết kế KiCad và tài liệu phần cứng. Vì vậy phần IoT bên dưới là **kiểm thử hợp đồng tích hợp và kiểm thử hộp đen**, chưa xác nhận thuật toán nội bộ firmware hoặc chứng nhận điện/phần cứng.
- Không bao gồm thư viện bên thứ ba, file sinh tự động, video/TVC, backup KiCad và bản minh họa `design-previews` như chức năng production.
- P0: bảo mật, sai thiết bị, sai tiền hoặc mất dữ liệu; P1: chức năng chính; P2: hiển thị và trải nghiệm. Ưu tiên chạy P0 trước khi phát hành.
- Ký hiệu nền tảng: **W** web; **M** mobile; **B** backend/worker; **D** database/Auth; **I** thiết bị/MQTT. `W/M` nghĩa là chạy riêng trên cả hai nền tảng, không lấy kết quả web thay mobile.
- Các bước trong một ô thực hiện theo thứ tự, ngăn cách bằng `→`. Các bộ giá trị trong cùng ô là những biến thể cần chạy riêng.
- Nhãn **[YC]** ở kết quả nghĩa là yêu cầu an toàn/đúng dữ liệu cần đạt, chưa khẳng định code hiện đã đáp ứng. Nhãn **[HT]** ghi nhận chính sách hiện được code; nếu muốn thay chính sách phải thống nhất yêu cầu trước khi đổi expected result.

### Điều kiện chung cho đợt chạy sau này

1. Dùng môi trường test riêng, dữ liệu có tiền tố `QA_`; email/FCM và broker test. Không dùng thông tin cá nhân thật.
2. Chuẩn bị khách A và B; admin; `staff`, `staff_warehouse`, `staff_shipper`, `staff_support`, `staff_maintenance`; phiên hết hạn và khách chưa đăng nhập.
3. A sở hữu bể A1/A2; B sở hữu B1. Có MAC rảnh, MAC đã ghép A1, MAC thuộc B1, MAC không tồn tại; firmware V1–V4. Tên MAC là fixture, không dùng MAC thật.
4. Thiết bị kiểm thử phải tách khỏi bể thật. Ca cần relay vật lý chỉ chạy trên bộ thử đã chuẩn bị; MQTT giả lập chỉ chứng minh lệnh, không chứng minh tải thực tế đã bật.
5. Chuẩn bị khả năng giả lập đồng hồ, lỗi HTTP/DB/MQTT/email/FCM, mạng chậm và phản hồi đảo thứ tự. Mỗi ca có dữ liệu riêng hoặc khôi phục snapshot sau ca.
6. Múi giờ nghiệp vụ `Asia/Ho_Chi_Minh`; server có thể chạy UTC. Lưu build/commit, thiết bị, trình duyệt, thời điểm và bằng chứng khi thực hiện.

### Dữ liệu chuẩn để đối chiếu

| Bộ | Dữ liệu | Kết quả chuẩn |
|---|---|---|
| SENSOR | Không gán loài; pH 7, nhiệt 26°C, TDS 200 ppm, đủ nước | Cả 4 chỉ số tốt; khiên xanh |
| BOUNDS | Mặc định: pH tốt 6,5–7,5 / cảnh báo 6–8; nhiệt tốt 24–28 / cảnh báo 22–30; TDS tốt 150–300 / cảnh báo 100–400 | So sánh các điểm biên và giá trị ngay ngoài biên; quá dải cảnh báo là nguy hiểm |
| SPECIES | pH 7–8, nhiệt 25–29, TDS 200–350 | Dải cảnh báo tương ứng 6,5–8,5; 23–31; 150–450 |
| REV | Năm đã kết thúc: T1=800 triệu, T2=760 triệu, T3=900 triệu; T4–T12=0; chỉ đơn delivered | T2=-5%; T3=18,42%; MA3(T3)=820 triệu; tổng năm=2,46 tỷ; đỉnh T3=900 triệu; tăng cao nhất18,42%; giảm mạnh nhất-100% tại T4 |
| VERSION | Một đơn delivered tổng900.000đ; item V1 có subtotal200.000đ, V3 có subtotal400.000đ | Phân bổ V1=300.000đ, V3=600.000đ; V2/V4=0 |
| CLOCK | 31/12/Y 16:59:59Z và 17:00:00Z | Lần lượt 31/12/Y và 01/01/(Y+1) tại Việt Nam |

## 2. Xác thực, phiên và phân quyền

Nguồn: `AquaCare_Web/src/App.tsx`, `authRoleCache.ts`, `pages/LoginPage.tsx`, `SignupPage.tsx`, `ForgotPasswordPage.tsx`; `AquaCare_App/lib/screens/{login_screen,signup_screen,splash_screen}.dart`, `services/supabase_service.dart`; `AquaCare_Backend/controllers/auth.controller.js`, `routes/auth.routes.js`.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| AUTH-01 | P1 W/M/B | Email chưa tồn tại → nhập đầy đủ họ tên/email/điện thoại/mật khẩu hợp lệ → đăng ký → kiểm tra Auth và users | Có một tài khoản và hồ sơ khớp ID; vai trò khách; thông báo đúng trạng thái xác nhận email của môi trường |
| AUTH-02 | P1 W/M/B | Lần lượt bỏ trống từng trường; email sai định dạng; mật khẩu dưới mức tối thiểu → gửi | Từ chối, chỉ rõ trường lỗi; không tạo hồ sơ rác; API thiếu trường trả400 |
| AUTH-03 | P1 W/M | Dùng email đã đăng ký → đăng ký lại → bấm gửi nhanh hai lần | Không tạo hai tài khoản/hồ sơ; không đổi thông tin tài khoản cũ |
| AUTH-04 | P0 B/D | Giả lập lỗi cập nhật users sau signUp qua API register | Báo lỗi; rollback Auth theo controller; kiểm tra không còn tài khoản mồ côi. Nếu rollback cũng lỗi phải ghi nhận để xử lý |
| AUTH-05 | P1 W/M | Đăng nhập lần lượt A, admin và từng role staff | Vào đúng màn hình theo vai trò; không giữ dữ liệu người trước |
| AUTH-06 | P1 W/M/B | Sai mật khẩu, email không tồn tại, thiếu identifier/password | Không có phiên đăng nhập; API sai thông tin401, thiếu trường400; không lộ mật khẩu trong lỗi |
| AUTH-07 | P1 B | Tài khoản test hỗ trợ phone/password → gọi login bằng phone; lặp bằng email | Nhánh email/phone xử lý đúng; lỗi của provider được báo, không tạo phiên giả |
| AUTH-08 | P1 W/M | Google OAuth thành công với user mới rồi user đã có hồ sơ | Tạo bổ sung hồ sơ khi cần; không tạo trùng hoặc tự nâng quyền; điều hướng đúng |
| AUTH-09 | P1 W/M | Hủy OAuth; provider lỗi; callback thiếu dữ liệu → thử lại | Trở lại đăng nhập có thể thao tác; không mắc loading hoặc ghi hồ sơ dở |
| AUTH-10 | P1 W/M | Đăng nhập → đóng/mở app hoặc reload → để access token hết hạn | Phiên hợp lệ được phục hồi/refresh; phiên không phục hồi được yêu cầu đăng nhập, không lặp vô hạn |
| AUTH-11 | P0 W/M | A đăng xuất → dùng Back/deep link → đăng nhập B | Không xem dữ liệu A; role cache/Realtime cũ không cấp quyền hoặc đẩy dữ liệu vào B |
| AUTH-12 | P1 W/M | Gửi quên mật khẩu bằng email test → mở link hợp lệ → đổi mật khẩu → đăng nhập lại | Mật khẩu mới dùng được; mật khẩu cũ thất bại; thông báo và luồng quay về đăng nhập đúng |
| AUTH-13 | P1 W/M | Link recovery hết hạn/dùng lại; mở màn reset trực tiếp; mật khẩu dưới6 hoặc xác nhận lệch | Không cập nhật mật khẩu trái phép; có lỗi rõ; không coi session thường là recovery hợp lệ |
| AUTH-14 | P0 W/D | Khách/khách A truy cập trực tiếp /admin và /staff; sửa role cache local thành admin | Quyền được xác minh từ nguồn tin cậy; không lấy được dữ liệu admin chỉ nhờ sửa local |
| AUTH-15 | P0 W/M/D | Admin hạ role một staff đang đăng nhập → staff thao tác lại | [YC] Quyền nhạy cảm bị thu hồi theo dữ liệu hiện tại; cache không duy trì quyền cũ |
| AUTH-16 | P1 W/M/B | Mạng mất/Render không truy cập được khi login; khôi phục → thử lại | Loading kết thúc, báo lỗi kết nối đúng; thử lại thành công, không mất dữ liệu form không cần thiết |

## 3. Landing, điều hướng và cập nhật ứng dụng

Nguồn: `AquaCare_Web/src/components/`, `pages/NotFoundPage.tsx`, `src/App.tsx`, `public/app-version.json`, `scripts/create-404.mjs`; `AquaCare_App/lib/services/app_version_service.dart`, `screens/app_version_gate.dart`, `onboarding_screen.dart`, `lib/main.dart`, `pubspec.yaml`.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| NAV-01 | P2 W | Mở landing desktop/mobile → đi qua menu, sản phẩm, gói, liên hệ, footer | Link/anchor tới đúng nội dung; không ảnh lỗi, nút bị che, tràn ngang; logo giữ tỷ lệ |
| NAV-02 | P1 W | Nhập /duong-dan-khong-ton-tai và đường dẫn sâu không tồn tại → reload | Hiện trang404 AquaCare; không màn trắng hay vòng chuyển hướng |
| NAV-03 | P2 W | Vào404 từ trang khác → Quay lại; mở404 trong tab mới → Về trang chủ | Back hoạt động theo lịch sử; về trang chủ luôn tới landing; không kẹt trang lỗi |
| NAV-04 | P1 W | Reload trực tiếp /login, /cart, /dashboard trên local và bản staging Vercel/GitHub Pages | Hosting fallback trả shell đúng; router xử lý quyền/trang; asset không404. Không nhầm404 API với trang404 |
| NAV-05 | P1 M | Cài mới → onboarding/splash → login; mở lại app đã hoàn tất onboarding | Luồng đầu tiên đúng; không yêu cầu onboarding lặp không chủ đích; Back không bypass auth/update gate |
| UPD-01 | P0 M | APK release có gate; installedBuild nhỏ hơn minimumBuildNumber → mở app | Màn cập nhật bắt buộc; không dùng dashboard qua Back/deep link/phiên đã đăng nhập |
| UPD-02 | P1 M | installedBuild bằng rồi lớn hơn minimumBuildNumber → kiểm tra | Cho dùng app; so sánh buildNumber, không so chuỗi version theo từ điển |
| UPD-03 | P1 M | App bị chặn → bấm Cập nhật | Mở landing AquaCare bằng browser ngoài; không giả định có tự tải/cài APK trong app |
| UPD-04 | P1 M | Browser không mở được → bấm Cập nhật | Có thông báo và có thể thử lại; app vẫn bị chặn nếu build cũ |
| UPD-05 | P1 M | Manifest timeout/non200/JSON lỗi/thiếu latestVersion/minimumBuildNumber không hợp lệ | [HT] Chặn bằng màn lỗi kiểm tra phiên bản, có thử lại; không tự coi app là mới nhất |
| UPD-06 | P1 M | Đang ở app → ra nền; nâng minimum build ở fixture → quay lại | Recheck khi resumed; build cũ bị chặn; không tạo nhiều request chồng hoặc setState sau dispose |
| UPD-07 | P1 M | Debug không override; debug có AQUACARE_VERSION_URL; Flutter web | [HT] Debug không override và nền tảng không Android bỏ gate; debug override dùng manifest test |
| UPD-08 | P0 W/M | Đối chiếu APK đã build với pubspec, manifest và nút/link landing → tải file qua link | Version/build của file thật khớp thông tin công bố; link tải đúng APK; minimum không cao hơn APK đang tải được |
| UPD-09 | P1 M | APK cũ không có mã gate → mở với manifest mới | Ghi nhận giới hạn: APK không có gate không tự bị chặn. Không báo đây là lỗi so sánh manifest của bản mới |

## 4. Bể, ghép thiết bị và giao diện tổng quan

Nguồn: `AquaCare_Web/src/pages/DashboardPage.tsx`, `components/CustomerOverview.tsx`; `AquaCare_App/lib/screens/dashboard_screen.dart`, `services/supabase_service.dart`, `widgets/tank_overview_hero.dart`.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TANK-01 | P1 W/M | A chưa có bể → mở tổng quan → thêm bể tên hợp lệ, chưa gán MAC | Empty state dùng được; tạo đúng chủ A; bể chưa có thiết bị không hiện dữ liệu của bể khác |
| TANK-02 | P1 W/M | Tên trống/chỉ dấu cách; thể tích âm/không phải số → lưu | [YC] Không lưu dữ liệu không hợp lệ; thông báo tại form |
| TANK-03 | P1 W/M | Thêm bể với loài SPECIES và MAC rảnh | Bể/loài đúng; thiết bị gắn đúng tank_id, active; không tạo thêm thiết bị trùng MAC |
| TANK-04 | P0 W/M/D | MAC không có, MAC thuộc B1 hoặc A2 → ghép vào A1 | Từ chối MAC không hợp lệ/đã ghép; bể cũ không bị chiếm thiết bị |
| TANK-05 | P0 W/M/D | Hai phiên cùng ghép một MAC rảnh vào hai bể | [YC] Chỉ một phiên thành công; không ghi đè âm thầm; UI thất bại khớp DB |
| TANK-06 | P1 W/M | Sửa tên/thể tích/loài A1 → reload cả web/mobile | Giá trị lưu bền; ngưỡng và trạng thái cập nhật theo loài mới |
| TANK-07 | P0 W/M/D | Đổi MAC A1 từ cũ sang rảnh mới → theo dõi cả hai thiết bị | MAC cũ tách/inactive; MAC mới gắn A1; không điều khiển nhầm MAC cũ |
| TANK-08 | P0 W/M/D | Gây lỗi sau tạo bể hoặc giữa tách MAC cũ/gắn MAC mới | [YC] Không báo thành công giả; có thể phục hồi; xác định bản ghi dở, không mất quyền thiết bị |
| TANK-09 | P1 W/M | Mở xóa bể → hủy; mở lại → xác nhận | Hủy giữ nguyên; xác nhận xóa đúng bể và chuyển lựa chọn hợp lệ |
| TANK-10 | P0 W/M/D | Xóa A1 có telemetry, cảnh báo, lịch và thiết bị | Không lỗi FK hoặc mất dữ liệu bể khác; thiết bị không tiếp tục lịch của bể đã xóa; lịch/log xử lý theo quan hệ schema |
| TANK-11 | P0 W/M | Đổi A1→A2 nhanh lúc request A1 đang chờ | Chỉ thấy dữ liệu A2; phản hồi A1 không ghi đè hình/trạng thái/thiết bị của A2 |
| TANK-12 | P2 W/M | Quan sát đủ9 ảnh; light/dark; nhiều kích thước | Ảnh thực sự thay đổi và phủ khối; cutout bo tự nhiên; Thêm bể không che text; shield/text ở đúng vị trí; dark mode nút tương phản |
| TANK-13 | P1 W/M | Thiết bị active→inactive→active → nạp telemetry | Trạng thái nhận dữ liệu theo is_active; không nhầm active với bật/tắt relay |

## 5. Telemetry, ngưỡng, lịch sử và cảnh báo

Nguồn: `AquaCare_Backend/server.js`, `config/species_thresholds.js`, `config/fcm.js`, `config/mailer.js`, `hardware_simulator.js`; web `components/speciesThresholds.ts`, `pages/DashboardPage.tsx`; mobile `utils/species_thresholds.dart`, `widgets/sensor_history_drill_down.dart`, `screens/alerts_screen.dart`, `services/fcm_service.dart`.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| DATA-01 | P1 B/I/W/M | MAC active của A1 → gửi SENSOR trên topic telemetry test | Ghi telemetry đúng thiết bị; pin1 nhiệt,2pH,3TDS,5nước; UI đúng đơn vị và giá trị |
| DATA-02 | P1 B/I | Gửi JSON hỏng, thiếu mac/readings hoặc không có sensor được hỗ trợ | Không crash worker/server; bỏ payload không hợp lệ; không ghi hàng toàn dữ liệu giả |
| DATA-03 | P0 B/I | Gửi dữ liệu từ MAC chưa đăng ký hoặc inactive | Không ghi telemetry/alert như thiết bị active |
| DATA-04 | P0 B/I | Gửi từng sensor thiếu, null, chuỗi, NaN biểu diễn dạng chuỗi, giá trị ngoài miền vật lý | [YC] Không biến thiếu dữ liệu thành0 hoặc cạn nước hợp lệ; không phát cảnh báo giả. Đặc biệt kiểm tra fallback hiện có trong parser |
| DATA-05 | P1 B/W/M | Chạy BOUNDS: đúng min/max tốt, ngay ngoài; đúng biên warn, ngay ngoài; giữ các sensor khác tốt | Web/mobile/backend phân loại thống nhất; tốt xanh, warning vàng, danger đỏ; giá trị ở biên được xử lý nhất quán |
| DATA-06 | P1 B/W/M | Gán SPECIES → lần lượt đưa giá trị vào các dải tốt/warn/danger | Áp dụng ngưỡng loài và margin đúng; không vẫn dùng mặc định |
| DATA-07 | P1 B/W/M | Loài thiếu/null/min≥max hoặc truy vấn loài lỗi | Dùng fallback có chủ đích, không crash; không nhầm null thành0; ghi nhận nếu các nền tảng fallback khác nhau |
| DATA-08 | P0 B/W/M | Các số tốt nhưng pin5=0; sau đó pin5=1 | Cạn nước làm danger/khiên đỏ; phục hồi đủ nước trả về trạng thái theo các sensor còn lại |
| DATA-09 | P1 W/M/D | Một sensor warn, một danger → khôi phục lần lượt → chuyển bể | Mức tổng hợp theo mức nghiêm trọng nhất; count/text khớp bể đang chọn |
| DATA-10 | P1 W/M | Lịch sử rỗng, một điểm, nhiều điểm; đổi sensor/khoảng thời gian/bể | Chart không lỗi trục; chỉ lấy đúng bể và khoảng; tooltip/đơn vị/ngày giờ chính xác |
| DATA-11 | P1 W/M/D | Mất mạng Realtime → nhận dữ liệu khi offline → kết nối lại | Khôi phục dữ liệu mới; không nhân bản điểm hoặc subscription; không hiện dữ liệu cũ như vừa nhận |
| DATA-12 | P1 B/I | Thiết bị đang simulator → telemetry thật tới → chờ chu kỳ simulator tiếp | Cờ simulator chuyển đúng; dữ liệu giả không tiếp tục ghi đè dữ liệu thật |
| ALERT-01 | P1 B/D | Gửi một telemetry bất thường khi tắt các kênh gửi | Lịch sử cảnh báo vẫn ghi; không gửi email/push chỉ vì có alert |
| ALERT-02 | P1 B/W/M | Lưu lần lượt none, critical_only, warning_only và chế độ toàn bộ → phát warn/danger | none không gửi; critical_only chỉ danger; [HT] warning_only bỏ lượt có danger; toàn bộ gửi theo cấu hình |
| ALERT-03 | P1 B | Cùng lúc một warn và một danger với warning_only | [HT] Lượt gửi bị bỏ vì hasDanger; ghi rõ hành vi này để xác nhận nghiệp vụ, không mặc định warn vẫn gửi |
| ALERT-04 | P1 B | Có nhiều sensor bất thường cùng mẫu | Nội dung gom đúng sensor/giá trị/bể; không gửi một thư riêng cho từng sensor trong cùng lượt |
| ALERT-05 | P1 B/D | Phát lặp trước, đúng và sau cooldown | Không spam trước hạn; sau hạn được gửi; kiểm tra mốc last_alert_sent_at và đơn vị cooldown |
| ALERT-06 | P1 W/M/B | Bật riêng email, riêng web, riêng app rồi cả ba | Chỉ kênh được bật nhận; nội dung và tài khoản đích đúng; cấu hình lưu qua reload |
| ALERT-07 | P1 B | Email lỗi nhưng FCM thành công; không có email/token; token hết hạn | Server không crash; xử lý kênh độc lập; [HT] mốc throttle có thể vẫn cập nhật khi email lỗi; không hứa tự gửi lại ngay |
| ALERT-08 | P0 W/M/D | A đăng xuất, B đăng nhập cùng máy → phát cảnh báo A | [YC] B không nhận nội dung riêng của A qua token/subscription còn sót |
| ALERT-09 | P1 W/M | Từ chối quyền push, rồi bật lại; nhận push foreground/background | Không chặn chức năng khác; xin quyền/đăng ký token đúng; không hiển thị hai lần cùng một thông báo |
| ALERT-10 | P1 W/M | Lọc lịch sử cảnh báo theo bể/mức/thời gian; không có kết quả; dữ liệu lớn | Bộ lọc và thống kê nhất quán, empty state đúng; không lẫn khách khác |

## 6. Điều khiển relay và lịch thiết bị

Nguồn: `AquaCare_Backend/server.js`, `timer_worker.js`; web `pages/DashboardPage.tsx`, `components/DeviceControlPanel.tsx`, `deviceScheduleTime.ts`; mobile `screens/control_screen.dart`, `services/supabase_service.dart`; hai migration trong `migrations/`.

**Hợp đồng hiện tại:** trạng thái nghiệp vụ `true=ON`, `false=OFF`; active-low chuyển ON thành MQTT `cmd: OFF`, OFF thành `cmd: ON`. Áp dụng cả lệnh tay và worker. Pump=pin3, Light=pin1, Aerator=pin2. Log vẫn dùng ON/OFF theo nghiệp vụ. Cần xác nhận tải vật lý riêng, vì publish thành công không đồng nghĩa relay đã tác động.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| RELAY-01 | P0 W/M/B/I | Mỗi relay ban đầu OFF → bấm ON → đối chiếu API, MQTT, DB, tải | Đúng pin/MAC/bể; cmd OFF; DB true, UI ON, log USER ON; tải thử bật |
| RELAY-02 | P0 W/M/B/I | Mỗi relay ban đầu ON → bấm OFF → đối chiếu các lớp | cmd ON; DB false, UI OFF, log USER OFF; tải thử tắt |
| RELAY-03 | P0 W/M/I | Điều khiển A1 rồi đổi A2; giữ B1 kết nối | Chỉ thiết bị được chọn thay đổi; relay khác và bể khác không đổi |
| RELAY-04 | P1 W/M/B | Bấm nhanh cùng nút nhiều lần lúc request pending | Không tạo chuỗi đảo trạng thái ngoài ý định; pending rõ; kết quả cuối khớp nguồn dữ liệu |
| RELAY-05 | P0 W/M | Gửi lệnh A1 → đổi A2 trước phản hồi; đẩy Realtime A1 cũ | Không ghi trạng thái A1 vào A2; pending/stale response được dọn đúng |
| RELAY-06 | P0 W/M/B/I | MQTT mất kết nối hoặc thiết bị offline → điều khiển | [YC] Không trình bày trạng thái DB là xác nhận vật lý chắc chắn; lỗi/pending được xử lý. Ghi riêng khả năng API trả200 dù tải không nhận |
| RELAY-07 | P0 B/D/I | Publish thành công nhưng update DB lỗi → thử lại từ UI | [YC] Báo lỗi và có cách đồng bộ lại; không đảo relay lần nữa chỉ vì retry; ghi nhận log/tải/DB lệch nếu có |
| RELAY-08 | P1 W/M | API treo quá timeout rồi trả muộn | Loading kết thúc, có thông báo; phản hồi muộn không ghi đè thao tác mới; user kiểm tra trạng thái được |
| RELAY-09 | P0 W/M/D | Hai máy cùng điều khiển một relay với ý định trái nhau | Trạng thái cuối nhất quán theo lệnh được xử lý sau; không log thành công cho lệnh thất bại; không nhấp nháy vô hạn |
| SCH-01 | P1 W/M/D | Tạo lịch một lần ngày tương lai ON08:00/OFF09:00 | Lưu device_schedules đúng device/relay/run_date; load lại đúng; không ghi sáu cột cũ |
| SCH-02 | P1 W/M/B | Tạo lịch hàng ngày ON08:00/OFF09:00 → giả lập hai ngày | is_daily true, run_date null; mỗi mốc chạy một lần/ngày; ngày thứ hai vẫn chạy |
| SCH-03 | P0 B/I | Lịch đến hạn của từng relay → kiểm tra payload và tải | Cùng ánh xạ active-low như lệnh tay; relay_logs AUTO dùng trạng thái nghiệp vụ |
| SCH-04 | P1 B/D | Worker tick nhiều lần cùng phút và sau restart | on/off_executed_on ngăn lặp; không thêm log/lệnh trùng cho mốc đã hoàn thành |
| SCH-05 | P1 W/M/B | Lịch một lần ON23:59/OFF00:01 → qua nửa đêm | ON ngày chọn, OFF ngày sau theo Việt Nam; hoàn tất thì inactive |
| SCH-06 | P1 B | ON=OFF ở lịch một lần; lặp lại với daily | [HT] Once coi off≤on là qua ngày; daily cùng phút ưu tiên OFF. Cần xác nhận đây là chính sách mong muốn trước khi cho phép UI lưu |
| SCH-07 | P1 B | Lịch once chỉ ON; lịch once chỉ OFF → đến hạn | Chạy đúng mốc; lịch hoàn tất không tiếp tục lặp ngày sau |
| SCH-08 | P1 W/M/D | Cả hai giờ trống, giờ sai, daily có date, once thiếu date → lưu/UI hoặc request | Bị validation/constraint từ chối; không tạo lịch worker không hiểu |
| SCH-09 | P0 D/W/M | Hai phiên cùng tạo lịch active cho cùng device/relay | Chỉ một lịch active theo unique index; UI xử lý xung đột, không báo cả hai thành công |
| SCH-10 | P1 W/M/B | Sửa giờ/ngày; tắt lịch trước hạn; bật lại; xóa lịch qua UI | Worker chỉ thực thi bản active mới; thao tác hủy không phụ thuộc quyền DELETE không được cấp; lịch cũ không chạy |
| SCH-11 | P1 B | Once chạy trễ1,2,3 phút; daily chạy trễ1 phút | [HT] Once có cửa sổ trễ tối đa2 phút; daily cần đúng phút. Ghi nhận mốc bị lỡ, không tự giả định có catch-up |
| SCH-12 | P0 B/I | Thiết bị inactive, mất tank_id hoặc MAC → lịch đến hạn | Không publish; không tạo log AUTO giả như đã bật tải |
| SCH-13 | P1 B/D | Relay đã đúng trạng thái trước mốc lịch | Không publish/log thay đổi dư; đánh dấu mốc xử lý để không lặp |
| SCH-14 | P0 B/D | Publish lỗi, update state lỗi, insert log lỗi, update schedule lỗi — từng lỗi riêng | Không đánh dấu hoàn tất trước bước cần thiết; retry không republish lệnh đã gửi trong cùng tiến trình; dữ liệu/log có thể phục hồi |
| SCH-15 | P0 B | Hai worker local và staging cùng chạy fixture một lịch | [YC] Tối đa một tác động nghiệp vụ; ghi nhận rủi ro khóa in-memory không ngăn hai process; không kết luận an toàn từ ca một process |
| SCH-16 | P1 B | Server UTC; lịch Việt Nam; cuối tháng/năm, 29/02 năm nhuận | Ngày thực thi đúng Asia/Ho_Chi_Minh, không lệch7 giờ hoặc bỏ ngày |
| SCH-17 | P0 W/M/B/D | DB test đã drop sáu cột legacy → mở/sửa lịch/điều khiển/restart worker | Không query/update cột đã xóa; lịch mới và relay_logs hoạt động; migration không xóa trạng thái relay |
| SCH-18 | P1 D | Trên DB test: áp migration theo thứ tự cũ→drop; thử dựng DB mới | Nhận diện migration ban đầu còn đọc cột cũ; quy trình khởi tạo phải có schema nền phù hợp, không mặc định chạy lại migration cũ sau drop là an toàn |

## 7. Giỏ hàng, đơn hàng và hỗ trợ

Nguồn: web `contexts/CartContext.tsx`, `pages/CartPage.tsx`, `components/ProductsSection.tsx`, `SubscriptionSection.tsx`, `ContactSection.tsx`.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| SHOP-01 | P1 W | Thêm V1/V3, thêm lặp V1, đổi số lượng, xóa; reload | Dòng hàng/số lượng và tổng giá đúng, không tạo dòng trùng ngoài ý định; persistence khớp thiết kế |
| SHOP-02 | P1 W | Số lượng0/âm/rất lớn/không nguyên; checkout giỏ rỗng | [YC] Không tạo đơn vô nghĩa; giới hạn hợp lệ rõ, tổng không âm/NaN |
| SHOP-03 | P1 W/D | Khách chưa login đặt COD đủ thông tin | orders pending user_id null và order_items khớp; success rồi mới xóa giỏ |
| SHOP-04 | P1 W/D | A đặt hàng, sửa địa chỉ giao khác địa chỉ cũ | Đơn gắn A, địa chỉ đơn đúng; cập nhật hồ sơ theo luồng hiện có không làm đổi đơn cũ |
| SHOP-05 | P1 W | Thiếu tên/phone/email/address, phone/email sai; note60 và61 từ | [YC] Form từ chối dữ liệu bắt buộc/sai; giới hạn note60 từ hoạt động theo UI |
| SHOP-06 | P0 W/D | Bấm đặt hai lần hoặc retry khi response chậm | [YC] Một ý định đặt hàng không tạo nhiều đơn; giỏ không bị xóa trước khi biết kết quả |
| SHOP-07 | P0 W/D | Insert orders thành công, insert order_items thất bại | [YC] Không có đơn thiếu hàng được xử lý như bình thường; UI không báo thành công; có rollback/khôi phục rõ |
| SHOP-08 | P0 W/D | Sửa giá, total_price, product_id, user_id/status trong request test | [YC] Giá/tổng/quyền sở hữu/trạng thái được kiểm tra phía tin cậy; không cho tự tạo đơn delivered giá tùy ý |
| SHOP-09 | P1 W | Chọn chuyển khoản → xem QR và xác nhận | Thông tin đúng khả năng hiện tại; QR placeholder không được hiểu là tích hợp thanh toán thật; không tự báo đã thanh toán nếu không có xác minh |
| SHOP-10 | P0 W/D | A mở lịch sử/chi tiết đơn; thử ID đơn B và khách vãng lai | Chỉ dữ liệu được phép; không lộ địa chỉ/phone/MAC của B |
| SHOP-11 | P1 W | Mở catalog gói cước có/rỗng/lỗi dữ liệu | Giá/thời hạn/quyền lợi đúng DB; không giả định có luồng mua/gia hạn tự động khi source chưa triển khai |
| SUP-01 | P1 W/D | Guest và A gửi hỗ trợ đủ tên/email/nội dung; phone/address tùy chọn | Tạo pending, nội dung chính xác; user_id gắn đúng khi login |
| SUP-02 | P1 W | Bỏ trường bắt buộc; email sai; gửi lặp; DB lỗi | Validation/lỗi rõ; không thông báo gửi thành công khi thất bại |
| SUP-03 | P0 W/D | Tra lịch sử theo email A bằng guest, B; gọi RPC trực tiếp | [YC] Không lộ nội dung riêng chỉ nhờ biết email; kiểm tra quyền RPC, không chỉ bộ lọc UI |
| SUP-04 | P1 W/D | Insert hỗ trợ lỗi UUID → nhánh retry bỏ user_id | Không tạo hai phiếu; vẫn có khả năng tra đúng phiếu theo thiết kế; không nới quyền dữ liệu |

## 8. Nhân viên và quy trình giao thiết bị

Nguồn: `AquaCare_Web/src/pages/StaffPage.tsx`, `AdminPage.tsx`; `AquaCare_App/lib/screens/staff_screen.dart`, `admin_screen.dart`, `services/supabase_service.dart`.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| STAFF-01 | P0 W/M/D | Đăng nhập từng role staff → mở các tab và thử truy vấn task loại khác | Warehouse packing/history; shipper delivery; support hỗ trợ; maintenance bảo trì; staff tổng hợp theo code. [YC] Quyền dữ liệu tương ứng, không chỉ ẩn tab |
| STAFF-02 | P1 W/M | Task todo chưa giao → nhận → hoàn thành | in_progress gắn người nhận; done có completed_at; vào lịch sử, không còn ở danh sách đang làm |
| STAFF-03 | P0 W/M/D | Hai nhân viên cùng nhận một task chưa giao | [YC] Chỉ một người được nhận; không ghi đè staff_id âm thầm |
| STAFF-04 | P0 W/M/D | Nhân viên B thao tác task đã giao A hoặc sửa status trực tiếp | [YC] Từ chối theo quyền; không hoàn tất hộ trái phép |
| STAFF-05 | P1 W/M/D | Admin duyệt đơn pending | Đơn confirmed; tạo một task packing đúng đơn/hàng; lỗi tạo task không bị che |
| STAFF-06 | P0 W/M/D | Hai admin duyệt cùng đơn; duyệt lại đơn đã confirmed | [YC] Không tạo hai task packing hoặc chuyển trạng thái lùi |
| STAFF-07 | P1 W/M/D | Đóng gói đơn có nhiều item và quantity>1, dùng MAC đúng version còn rảnh | Mỗi đơn vị có MAC; order_items lưu đúng; device active; packing done; một task delivery_install được tạo |
| STAFF-08 | P0 W/M/D | Thiếu MAC; trùng MAC khác hoa/thường/khoảng trắng; MAC không tồn tại | Từ chối trước khi hoàn tất; không gán thiếu/trùng thiết bị |
| STAFF-09 | P0 W/M/D | MAC active/đã ghép bể hoặc version khác sản phẩm | Không lấy thiết bị đang dùng/sai phiên bản để giao |
| STAFF-10 | P0 W/M/D | Hai đơn cùng đóng gói một MAC rảnh | [YC] MAC chỉ được cấp cho một đơn; không chỉ kiểm tra bản snapshot cũ |
| STAFF-11 | P0 W/M/D | Lỗi giữa cập nhật items, active device, done task, tạo delivery | [YC] Không báo toàn bộ thành công khi dở; retry không tạo task trùng; xác định được items/MAC đã xử lý |
| STAFF-12 | P1 W/M/D | Shipper hoàn tất delivery_install | Task done và đơn delivered đúng; doanh thu chỉ bắt đầu tính khi đơn đủ điều kiện |
| STAFF-13 | P1 W/M/D | Support trả lời phiếu → khách xem lịch sử | Nội dung staff_reply và status replied đúng; khách chỉ xem phiếu của mình |
| STAFF-14 | P1 W/M/D | Chuyển phiếu sang bảo trì; có/không có đơn trước theo email/phone | Tạo maintenance task đúng nội dung; địa chỉ fallback theo code, không lấy nhầm khách; thiếu địa chỉ hiển thị rõ |
| STAFF-15 | P1 W/M | Lịch sử rỗng/nhiều task; task_type legacy giao/lắp/bảo trì | Hiển thị và lọc đúng các kiểu được code hỗ trợ; không mất task vì tên cũ |

## 9. Quản trị danh mục, thiết bị, nhân viên và gói

Nguồn: `AquaCare_Web/src/pages/AdminPage.tsx`; `AquaCare_App/lib/screens/admin_screen.dart`, `services/supabase_service.dart`, `models/`.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| ADM-01 | P1 W/M | Thêm loài → sửa ngưỡng → tìm kiếm → xóa loài chưa dùng | CRUD đúng và tải lại nhất quán; ngưỡng lưu dạng số |
| ADM-02 | P1 W/M/D | Loài tên trùng/trống; min=max/min>max; pH ngoài0–14; dữ liệu không số | [YC] Từ chối dữ liệu sai, không để cấu hình không hợp lệ âm thầm thành fallback |
| ADM-03 | P0 W/M/D | Xóa loài đang gắn bể | FK/xử lý tham chiếu rõ; không xóa bể theo ngoài ý định; bể còn dùng được với ngưỡng hợp lệ |
| ADM-04 | P1 W/M | Thêm MAC theo dòng/dấu phẩy, có khoảng trắng và hoa/thường | Chuẩn hóa nhất quán; đúng số thiết bị/version; không dòng rỗng |
| ADM-05 | P0 W/M/D | Batch có MAC trùng nội bộ/trùng DB và một phần hợp lệ | Không trùng inventory; báo rõ batch thất bại hay phần nào đã lưu; retry không nhân bản |
| ADM-06 | P0 W/M/D | Sửa MAC thành MAC đã có; xóa thiết bị đang có bể/lịch/đơn | Không phá lịch sử hoặc điều khiển sai thiết bị; xung đột/FK được báo rõ |
| ADM-07 | P1 W/M | Tra người mua từ thiết bị đã giao/chưa giao | Đúng đơn và người mua; trạng thái chưa có người mua không dùng thông tin dòng trước |
| ADM-08 | P0 W/M/D | Admin tạo staff đầy đủ; ngay sau đó kiểm tra session admin | Staff role đúng; admin vẫn là admin, không bị signUp thay session sang nhân viên mới |
| ADM-09 | P1 W/M | Tạo staff thiếu trường/trùng phone/email; sửa tên/phone/role | Validation và quyền cập nhật đúng; không tạo Auth mà thiếu profile hoặc ngược lại |
| ADM-10 | P0 W/M/D | Xóa staff rồi thử token cũ và đăng nhập lại bằng Auth còn tồn tại | [YC] Không còn quyền staff. Phân biệt xóa users với xóa tài khoản Auth; không coi xóa profile là thu hồi session đầy đủ |
| ADM-11 | P1 W/M | Thêm gói: giá/thời hạn/max_tanks/history_days/setup; trên mobile sửa/xóa | Giá trị đúng và landing cập nhật; chỉ test thao tác thực sự có UI. Web hiện có luồng thêm, không mặc định có sửa/xóa như mobile |
| ADM-12 | P1 W/M | Gói tên rỗng, giá âm, thời hạn0/âm, giới hạn không nguyên | [YC] Từ chối hoặc có quy ước giá trị đặc biệt rõ; không làm landing hiển thị dữ liệu sai |
| ADM-13 | P1 W/M | Tìm/lọc đơn theo trạng thái, xem chi tiết item/MAC | Kết quả, tổng tiền, người nhận, phiên bản và MAC đúng đơn |

## 10. Dashboard doanh thu và thống kê

Nguồn: `AquaCare_Backend/routes/admin-dashboard.routes.js`; web `pages/adminAnnualData.ts`, `AdminDashboardPreview.tsx`, `MonthlyRevenuePreview.tsx`, `VersionRevenuePreview.tsx`; mobile `widgets/admin_revenue_panels.dart`, `screens/admin_screen.dart`.

**Cơ sở hiện tại:** đơn `delivered`, xếp tháng theo `orders.created_at` giờ Việt Nam; không phải ngày giao hàng hoặc ngày tiền về. MA3 gồm tháng hiện tại và hai tháng trước trong cùng năm. Không có mẫu số dương thì growth=null. Hai tháng đầu MA3=null. Tháng tương lai của năm hiện tại là null, tháng đã qua không có đơn là0.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| REV-01 | P0 B/W/M | Nạp REV vào năm quá khứ → mở bảng/line chart | Đủ12 tháng; T1/T2/T3 đúng, các tháng còn lại0; hai line revenue/MA3, đơn vị tiền chính xác |
| REV-02 | P0 B/W/M | Đối chiếu growth T1/T2/T3/T4/T5 của REV | null, -5%, 18,42%, -100%, null; không Infinity/NaN; UI dùng dấu “—” cho null |
| REV-03 | P0 B/W/M | Đối chiếu MA3 của REV T1–T4 | T1/T2 null; T3=820.000.000; T4=553.333.333; làm tròn đồng theo backend |
| REV-04 | P0 B/W/M | REV → xem tổng và Điểm nổi bật | Tổng2,46 tỷ; đỉnh900 triệu/T3; tăng18,42%; giảm-100%; bảng và chart dùng cùng dữ liệu |
| REV-05 | P1 B/W/M | Hai tháng cùng doanh thu cao nhất; chỉ tăng; chỉ giảm; cả năm0 | [HT] Đỉnh đồng hạng chọn tháng đầu; không có tăng/giảm thì chỉ tiêu đó null; năm0 peakMonth null |
| REV-06 | P0 B/W/M | Đơn created T1 nhưng delivered T3; thêm pending/confirmed/shipping/cancelled | [HT] Đơn delivered tính T1; các trạng thái khác không vào revenue; nhãn mô tả không gây hiểu nhầm doanh thu theo ngày giao |
| REV-07 | P0 B/D | Đơn ở hai mốc CLOCK và ranh giới mỗi tháng | Ghi đúng năm/tháng Việt Nam; cận cuối không bị tính hai lần |
| REV-08 | P1 W/M/B | Chọn năm quá khứ/năm hiện tại → đổi nhanh năm nhiều lần khi mạng chậm | Filter, bảng, chart, highlights cùng năm; response cũ không đè năm mới |
| REV-09 | P1 B | annual không truyền year; year=1999, năm tương lai, abc,2026.5, tham số lặp | Mặc định năm hiện tại; giá trị không hợp lệ400; không crash/500 do input |
| REV-10 | P1 B/W/M | Năm hiện tại đang T10, không có dữ liệu T7–T12 | T7–T10=0; T11–T12=null; không nối MA3 qua tháng tương lai hay hiển thị tương lai thành doanh thu0 đã ghi nhận |
| REV-11 | P0 B | Seed501 và1001 đơn delivered, có created_at trùng | Phân trang500 lấy đủ, ổn định theo created_at/id; tổng không bỏ/trùng đơn |
| REV-12 | P0 B/W/M | VERSION → lọc đúng tháng/năm | V1=300.000; V3=600.000; tỷ trọng33,3%/66,7% theo format; tổng version900.000 |
| REV-13 | P0 B | Tổng đơn100đ; ba item cùng subtotal thuộc V1/V2/V3 | Phân bổ33/33/34 theo thứ tự items; tổng100, không hụt tiền do làm tròn |
| REV-14 | P1 B/W/M | Có item product_id ngoàiV1–V4, item subtotal≤0, đơn total âm/không hợp lệ | [HT] Annual bỏ total không hợp lệ/âm; item không hợp lệ không phân bổ. Version lạ không vào4 cột: phát hiện chênh tổng, không ép khớp sai |
| REV-15 | P1 W/M | Đổi tháng rồi năm ở bảng version, có tháng rỗng | Đúng kỳ; dữ liệu cũ không còn; tổng0 không chia cho0 |
| REV-16 | P2 W/M | Version revenue khác nhau, đồng hạng thấp/cao, toàn0 | Cao nhất xanh, chỉ mức thấp nhất đỏ nhạt; không tô mọi version còn lại đỏ. Trường hợp đồng hạng phải nhất quán và không vừa cao vừa thấp gây nhầm |
| REV-17 | P1 W/M/B | API404/401/403/500, timeout → khôi phục → Thử lại | Thông báo đúng; không thay lỗi bằng số0/mẫu demo; dữ liệu phục hồi khi thử lại |
| REV-18 | P1 B/W/M | Kiểm tra KPI đơn pending/packing/shipping; devices assigned; staff;4 đơn gần nhất | Đếm đúng nguồn: packing từ task đang mở, devices có tank_id, role staff%; không lẫn số lượng task với số đơn |
| REV-19 | P1 B/W/M | Các đơn quanh ranh giới tháng; xem7/30 ngày và tăng trưởng tháng | Series đủ ngày, thiếu ngày điền0; tổng và mức tăng đúng; tháng trước0 thì phần trăm null |
| REV-20 | P2 W/M | Mobile320/360/390px, chữ lớn, light/dark → mở từng tháng và filter năm/tháng | Không bắt kéo ngang toàn màn; vùng highlight khớp hàng; text filter rõ; expand MA3 đúng tháng; chart tooltip chạm được |

## 11. Bảo mật và tính toàn vẹn dữ liệu

Các ca sau là yêu cầu kiểm thử, **không phải khẳng định lỗ hổng đã khai thác/đã xác nhận**. Chỉ dùng hai tài khoản và dữ liệu fixture trong môi trường riêng. Không chép khóa hoặc dữ liệu thật vào bằng chứng.

Nguồn: `server.js`, `routes/admin-dashboard.routes.js`, auth controller; các thao tác Supabase trực tiếp trong web/mobile; migration `device_schedules`; cấu hình build/hosting.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| SEC-01 | P0 B | GET admin dashboard/annual không token, token sai/hết hạn, token A, token admin | Lần lượt401,401,403,200; dữ liệu admin có private,no-store |
| SEC-02 | P0 B/I | POST relay/command không token, token A với tank B1 | [YC] Từ chối trước publish/update; không có tác động IoT ngoài quyền |
| SEC-03 | P0 B/D | Relay payload state chuỗi/null, pin ngoài1–3, relay_field ngoài danh sách hoặc không khớp pin | [YC]400; không update cột tùy ý hoặc publish sai kênh |
| SEC-04 | P0 D | Với A: đọc/sửa/xóa tanks, devices, telemetry, alerts, relay_logs của B qua Data API | [YC] RLS chặn từng thao tác, không chỉ UI; dữ liệu B giữ nguyên |
| SEC-05 | P0 D | A insert/update device_schedules cho B; đổi device_id của lịch A sang B | RLS USING/WITH CHECK chặn; lịch B không bị xem/sửa/chiếm |
| SEC-06 | P0 D | Khách/staff tự update users.role; sửa user_id của bể/đơn; sửa giá và trạng thái đơn | [YC] Từ chối nâng quyền/chiếm dữ liệu/gian lận; role không lấy từ dữ liệu người dùng sửa được |
| SEC-07 | P0 D | Guest/A gọi RPC lịch sử support; truy vấn view nếu được expose | [YC] Không vượt RLS qua function/view; scope dữ liệu theo chính sách xác thực, không chỉ email tự nhập |
| SEC-08 | P0 W/M/B | Kiểm tra bundle/APK/config công khai và lỗi runtime | Không có service_role, SMTP/Brevo secret, MQTT password, access/refresh token trong log; publishable/anon key không được nhầm là bí mật nếu có RLS đúng |
| SEC-09 | P1 W/D | Lưu chuỗi chứa HTML/script vô hại vào tên bể/support/note → hiển thị các role | Nội dung chỉ là text; không chạy script, không phá layout |
| SEC-10 | P1 B | Request từ origin local/staging hợp lệ và origin ngoài allowlist; OPTIONS | CORS theo chính sách; preflight không cấp quyền API; client không Origin vẫn cần auth cho thao tác riêng tư |
| SEC-11 | P1 W/B | Đọc response hosting test cho env/git/source-map/debug và header HTTPS | [YC] Không công khai file bí mật/debug; ghi riêng policy header cần đạt. Không suy ra an toàn chỉ từ status200 của SPA fallback |
| SEC-12 | P1 W/M/B | Lặp đăng nhập/support/checkout bằng số lượng giới hạn trong môi trường test | [YC] Có cơ chế chống lạm dụng theo giới hạn thống nhất; không gửi mail/đơn vô hạn. Nếu chưa có SLA/limit, ghi thiếu yêu cầu thay vì tự đặt ngưỡng pass |

## 12. Khả năng phục hồi, cấu hình và trải nghiệm chung

Nguồn: web `src/config/api.ts`, Vite/hosting/scripts/workflows; mobile `lib/config/api_config.dart`, `main.dart`, `customer_theme.dart`; backend `server.js`, `config/`, `timer_worker.js`.

| ID | Ưu tiên / nền tảng | Tiền điều kiện, dữ liệu và bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| OPS-01 | P1 W/M/B | Dev web qua Vite proxy; Android emulator; AQUACARE_API_URL override; cấu hình release | Dev đến backend local phù hợp; release đến Render; không phải sửa endpoint source giữa hai môi trường |
| OPS-02 | P1 W/M/B | Backend chưa chạy, khởi động chậm hoặc restart → mở màn có API | Lỗi kết nối/timeout rõ, có retry; không mất phiên và không báo số liệu0 như thành công |
| OPS-03 | P0 B | MQTT mất→kết nối lại; DB mất→phục hồi; worker tick đang xử lý | Server sống; đăng ký lại đúng; không chạy chồng tick; không lặp tác động đã hoàn tất |
| OPS-04 | P1 B | Thiếu từng biến môi trường bắt buộc trong bản test → khởi động | Lỗi cấu hình có thể chẩn đoán, không in secret; không âm thầm chạy bằng credential khác |
| OPS-05 | P2 W/M | Toàn màn chính ở light/dark, keyboard mở, font lớn, portrait/landscape | Text/nút đọc được, modal cuộn được, không overflow; thao tác chính không bị navigation/keyboard che |
| OPS-06 | P2 W | Keyboard Tab/Enter/Escape trên login, modal bể, bộ lọc,404; icon-only button | Focus thấy rõ, nhãn truy cập có nghĩa, không bẫy focus; nút cấu hình/xóa phân biệt được |
| OPS-07 | P1 W/M | Đổi tab/bể và vào/ra dashboard20 lần trong dữ liệu test | Không nhân subscription/timer/request; không crash khi dispose; carousel không chạy chồng |
| OPS-08 | P1 W/M/B | Dữ liệu lịch sử lớn và501+ đơn → đo thời gian tải/bộ nhớ | Kết quả đầy đủ, có loading, không khóa UI. Ghi số đo; SLA hiệu năng cần chốt riêng trước khi đánh Pass/Fail về tốc độ |
| OPS-09 | P1 W | Deploy thử staging → mở deep link và tải asset/APK/manifest | Rewrite không biến API/APK thành HTML; cache không giữ manifest/version cũ sau cập nhật |
| OPS-10 | P0 W/M/B/D | Luồng đầy đủ: guest đặt hàng → admin duyệt → kho gán MAC → shipper giao → A ghép bể → telemetry → điều khiển → lịch → cảnh báo | Mỗi bước liên kết cùng đơn/MAC/bể/chủ; doanh thu chỉ đúng điều kiện; không cần sửa DB thủ công để đi hết luồng |
| OPS-11 | P0 W/M/B/D | Luồng cách ly: A và B thực hiện đồng thời thao tác bể/thiết bị/đơn | Không rò dữ liệu hoặc gửi lệnh/thông báo nhầm người; lỗi một người không làm mất trạng thái người kia |

## 13. Những điểm cần xác nhận khi bắt đầu chạy

1. **Database đang triển khai:** chưa truy vấn DB thật trong lần soạn này; policy/migration thực tế có thể khác checkout. Kiểm tra schema và role grants trước khi kết luận ca RLS pass.
2. **Firmware:** cần source hoặc tài liệu giao thức chính thức để mở rộng unit test ESP32/STM32; các ca RELAY/SCH hiện bao phủ từ giao diện đến hành vi tải qua hợp đồng active-low.
3. **Lịch:** daily bỏ mốc trễ, once có cửa sổ2 phút, ON=OFF khác nhau theo chế độ; đây là các chính sách cần chấp thuận rõ.
4. **Doanh thu:** theo ngày tạo của đơn đã delivered; version chỉ V1–V4, có thể khác tổng đơn khi có loại hàng khác. Không đổi oracle sang doanh thu thu tiền nếu chưa đổi nghiệp vụ.
5. **Tính nguyên tử:** tạo đơn/items, chuyển MAC, đóng gói và duyệt đơn gồm nhiều lần ghi; ưu tiên ca lỗi giữa chừng và cạnh tranh.
6. **Bật/tắt:** database/log phản ánh trạng thái nghiệp vụ, không mặc định là ACK phần cứng. Phải quan sát tải trong ca end-to-end.
7. **Chức năng chưa mở:** tab hiệu chuẩn pH web và route game đang bị vô hiệu hóa trong luồng chính. Không đưa chúng thành chức năng production phải có; nếu mở lại cần thêm test giao thức/điều kiện hiệu chuẩn riêng.
8. **Thanh toán:** chưa đặt expected tự đối soát chuyển khoản, hoàn tiền hoặc gia hạn gói khi source chưa cung cấp luồng đó.
9. **Gói cước:** cần chốt việc thực thi max_tanks/history_days trên backend nếu muốn kiểm thử giới hạn thuê bao, thay vì suy ra từ trường cấu hình.

## 14. Đối chiếu với test tự động hiện có — chưa chạy lại

| File hoặc nhóm | Các ca trong tài liệu có liên quan | Phần vẫn cần kiểm thử tích hợp/thủ công |
|---|---|---|
| `AquaCare_Backend/test/timer_worker.test.js` | SCH, active-low AUTO | Hai worker, DB thật, MQTT reconnect, tải vật lý |
| `AquaCare_Backend/test/admin_dashboard.test.js` | REV, SEC-01 | Phân trang DB thật, layout web/mobile, dữ liệu lớn |
| `AquaCare_Backend/test/mailer.test.js` | ALERT | Provider test, cấu hình kênh và cooldown toàn luồng |
| `AquaCare_Web/tests/deviceScheduleTime.test.mjs` | SCH | UI lưu/đọc DB và đồng bộ hai client |
| `AquaCare_App/test/app_version_gate_test.dart` | UPD | Release APK, browser ngoài, file APK thật |
| `AquaCare_App/test/admin_revenue_panels_test.dart` | REV | API thật, role, thao tác nhiều thiết bị |
| `AquaCare_App/test/species_thresholds_test.dart` | DATA | Đồng nhất web/backend và dữ liệu loài thực |
| `AquaCare_App/test/tank_overview_hero_test.dart` | TANK-12 | Chất lượng ảnh, animation và dark mode trên máy thật |
| `AquaCare_App/test/auth_ui_test.dart`, `responsive_layout_test.dart`, `widget_test.dart` | AUTH, OPS | Auth/OAuth thật, phiên, khả năng truy cập và thiết bị nhỏ |

Sự tồn tại của file test không đồng nghĩa test bao phủ hết ca được ánh xạ hoặc đang Pass.

## 15. Mẫu ghi kết quả khi thực hiện sau này

Mỗi biến thể nền tảng/dữ liệu cần một dòng kết quả riêng. Ban đầu mọi ID ở trên đều **Chưa chạy**.

| Test ID / biến thể | Build/commit | Môi trường/thiết bị | Kết quả thực tế | Trạng thái | Bằng chứng/Bug ID | Người chạy/thời gian |
|---|---|---|---|---|---|---|
| Ví dụ: RELAY-01 / mobile / Pump | Chưa ghi | Chưa ghi | Chưa thực hiện | Chưa chạy | — | — |

Trạng thái được dùng: Chưa chạy / Pass / Fail / Blocked / Không áp dụng (ghi lý do). Không đánh Pass khi chỉ xem source. Khi kết thúc từng ca, xóa dữ liệu QA hoặc phục hồi snapshot theo kế hoạch của môi trường test.
