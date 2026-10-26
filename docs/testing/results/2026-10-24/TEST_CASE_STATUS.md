# Bảng trạng thái178 test case AquaCare

Ngày đối chiếu:24/10/2026. Dữ liệu từ lần chạy được lưu trong [báo cáo](REPORT.md); không chạy lại test khi lập bảng.

90 test tự động có sẵn và178 test case hệ thống là hai tập khác nhau. Một ca hệ thống có thể cần nhiều test tự động,thao tác UI và kiểm chứng dữ liệu/thực tế. Nhiều test tự động cũng chỉ kiểm tra các kích thước khác nhau của cùng widget. Vì vậy không lấy178−90 để suy ra số ca chưa chạy.

| PASS toàn ca hệ thống | FAIL được xác nhận | Chưa hoàn tất (có bằng chứng một phần) | Chưa chạy | Tổng |
|---:|---:|---:|---:|---:|
| 0 | 0 | 41 | 137 | 178 |

- **PASS:** đủ tất cả bước,kết quả và biến thể nền tảng đã yêu cầu.
- **FAIL:** đã thực thi và có bằng chứng sai expected result.
- **CHƯA HOÀN TẤT:** test liên quan có PASS nhưng chưa đủ để kết luận toàn ca.
- **CHƯA CHẠY:** chưa có bằng chứng thực thi được ánh xạ tới ca. Không đồng nghĩa FAIL.

Đợt trước đã chạy90 test tự động:90 PASS,0 FAIL. Chi tiết từng test nằm ở [bảng90 kết quả](AUTOMATED_TEST_RESULTS.md). Mã BE/WEB/FL dưới đây trỏ tới bảng đó.

## Toàn bộ test case

| ID | Ưu tiên / nền tảng | Kịch bản cần test | Trạng thái toàn ca | Test tự động liên quan đã PASS | Phần còn thiếu |
|---|---|---|---|---|---|
| AUTH-01 | P1 W/M/B | Email chưa tồn tại → nhập đầy đủ họ tên/email/điện thoại/mật khẩu hợp lệ → đăng ký → kiểm tra Auth và users | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-02 | P1 W/M/B | Lần lượt bỏ trống từng trường; email sai định dạng; mật khẩu dưới mức tối thiểu → gửi | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-03 | P1 W/M | Dùng email đã đăng ký → đăng ký lại → bấm gửi nhanh hai lần | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-04 | P0 B/D | Giả lập lỗi cập nhật users sau signUp qua API register | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-05 | P1 W/M | Đăng nhập lần lượt A, admin và từng role staff | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-06 | P1 W/M/B | Sai mật khẩu, email không tồn tại, thiếu identifier/password | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-07 | P1 B | Tài khoản test hỗ trợ phone/password → gọi login bằng phone; lặp bằng email | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-08 | P1 W/M | Google OAuth thành công với user mới rồi user đã có hồ sơ | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-09 | P1 W/M | Hủy OAuth; provider lỗi; callback thiếu dữ liệu → thử lại | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-10 | P1 W/M | Đăng nhập → đóng/mở app hoặc reload → để access token hết hạn | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-11 | P0 W/M | A đăng xuất → dùng Back/deep link → đăng nhập B | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-12 | P1 W/M | Gửi quên mật khẩu bằng email test → mở link hợp lệ → đổi mật khẩu → đăng nhập lại | **CHƯA HOÀN TẤT** | [FL-62](AUTOMATED_TEST_RESULTS.md#fl-62) | Chỉ mở form recovery; chưa gửi email,mở link,đổi mật khẩu và đăng nhập. |
| AUTH-13 | P1 W/M | Link recovery hết hạn/dùng lại; mở màn reset trực tiếp; mật khẩu dưới6 hoặc xác nhận lệch | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-14 | P0 W/D | Khách/khách A truy cập trực tiếp /admin và /staff; sửa role cache local thành admin | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-15 | P0 W/M/D | Admin hạ role một staff đang đăng nhập → staff thao tác lại | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| AUTH-16 | P1 W/M/B | Mạng mất/Render không truy cập được khi login; khôi phục → thử lại | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| NAV-01 | P2 W | Mở landing desktop/mobile → đi qua menu, sản phẩm, gói, liên hệ, footer | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| NAV-02 | P1 W | Nhập /duong-dan-khong-ton-tai và đường dẫn sâu không tồn tại → reload | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| NAV-03 | P2 W | Vào404 từ trang khác → Quay lại; mở404 trong tab mới → Về trang chủ | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| NAV-04 | P1 W | Reload trực tiếp /login, /cart, /dashboard trên local và bản staging Vercel/GitHub Pages | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| NAV-05 | P1 M | Cài mới → onboarding/splash → login; mở lại app đã hoàn tất onboarding | **CHƯA HOÀN TẤT** | [FL-35](AUTOMATED_TEST_RESULTS.md#fl-35), [FL-50](AUTOMATED_TEST_RESULTS.md#fl-50), [FL-51](AUTOMATED_TEST_RESULTS.md#fl-51) | Mới widget splash/onboarding; chưa cài mới,persistence,auth và Back trên app. |
| UPD-01 | P0 M | APK release có gate; installedBuild nhỏ hơn minimumBuildNumber → mở app | **CHƯA HOÀN TẤT** | [FL-02](AUTOMATED_TEST_RESULTS.md#fl-02) | Widget gate chặn nội dung; chưa APK release,Back/deep link và session thật. |
| UPD-02 | P1 M | installedBuild bằng rồi lớn hơn minimumBuildNumber → kiểm tra | **CHƯA HOÀN TẤT** | [FL-01](AUTOMATED_TEST_RESULTS.md#fl-01), [FL-03](AUTOMATED_TEST_RESULTS.md#fl-03) | Mới service/widget test; chưa xác minh APK đã cài. |
| UPD-03 | P1 M | App bị chặn → bấm Cập nhật | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| UPD-04 | P1 M | Browser không mở được → bấm Cập nhật | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| UPD-05 | P1 M | Manifest timeout/non200/JSON lỗi/thiếu latestVersion/minimumBuildNumber không hợp lệ | **CHƯA HOÀN TẤT** | [FL-05](AUTOMATED_TEST_RESULTS.md#fl-05) | Mới lỗi check giả lập và retry; chưa đủ timeout,HTTP,JSON và schema manifest. |
| UPD-06 | P1 M | Đang ở app → ra nền; nâng minimum build ở fixture → quay lại | **CHƯA HOÀN TẤT** | [FL-04](AUTOMATED_TEST_RESULTS.md#fl-04) | Lifecycle giả lập; chưa thiết bị thật,request chồng và dispose. |
| UPD-07 | P1 M | Debug không override; debug có AQUACARE_VERSION_URL; Flutter web | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| UPD-08 | P0 W/M | Đối chiếu APK đã build với pubspec, manifest và nút/link landing → tải file qua link | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| UPD-09 | P1 M | APK cũ không có mã gate → mở với manifest mới | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| TANK-01 | P1 W/M | A chưa có bể → mở tổng quan → thêm bể tên hợp lệ, chưa gán MAC | **CHƯA HOÀN TẤT** | [FL-57](AUTOMATED_TEST_RESULTS.md#fl-57) | Mới service với HTTP mock; chưa empty state,modal hủy/xác nhận và DB thật. |
| TANK-02 | P1 W/M | Tên trống/chỉ dấu cách; thể tích âm/không phải số → lưu | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| TANK-03 | P1 W/M | Thêm bể với loài SPECIES và MAC rảnh | **CHƯA HOÀN TẤT** | [FL-58](AUTOMATED_TEST_RESULTS.md#fl-58) | Mới request mock tạo bể và gán thiết bị; chưa DB,loài và cả web/mobile. |
| TANK-04 | P0 W/M/D | MAC không có, MAC thuộc B1 hoặc A2 → ghép vào A1 | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| TANK-05 | P0 W/M/D | Hai phiên cùng ghép một MAC rảnh vào hai bể | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| TANK-06 | P1 W/M | Sửa tên/thể tích/loài A1 → reload cả web/mobile | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| TANK-07 | P0 W/M/D | Đổi MAC A1 từ cũ sang rảnh mới → theo dõi cả hai thiết bị | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| TANK-08 | P0 W/M/D | Gây lỗi sau tạo bể hoặc giữa tách MAC cũ/gắn MAC mới | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| TANK-09 | P1 W/M | Mở xóa bể → hủy; mở lại → xác nhận | **CHƯA HOÀN TẤT** | [FL-57](AUTOMATED_TEST_RESULTS.md#fl-57) | Mới service với HTTP mock; chưa empty state,modal hủy/xác nhận và DB thật. |
| TANK-10 | P0 W/M/D | Xóa A1 có telemetry, cảnh báo, lịch và thiết bị | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| TANK-11 | P0 W/M | Đổi A1→A2 nhanh lúc request A1 đang chờ | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| TANK-12 | P2 W/M | Quan sát đủ9 ảnh; light/dark; nhiều kích thước | **CHƯA HOÀN TẤT** | [FL-14](AUTOMATED_TEST_RESULTS.md#fl-14), [FL-15](AUTOMATED_TEST_RESULTS.md#fl-15), [FL-22](AUTOMATED_TEST_RESULTS.md#fl-22), [FL-25](AUTOMATED_TEST_RESULTS.md#fl-25), [FL-26](AUTOMATED_TEST_RESULTS.md#fl-26), [FL-27](AUTOMATED_TEST_RESULTS.md#fl-27), [FL-29](AUTOMATED_TEST_RESULTS.md#fl-29), [FL-31](AUTOMATED_TEST_RESULTS.md#fl-31), [FL-33](AUTOMATED_TEST_RESULTS.md#fl-33), [FL-34](AUTOMATED_TEST_RESULTS.md#fl-34), [FL-36](AUTOMATED_TEST_RESULTS.md#fl-36), [FL-37](AUTOMATED_TEST_RESULTS.md#fl-37), [FL-40](AUTOMATED_TEST_RESULTS.md#fl-40), [FL-41](AUTOMATED_TEST_RESULTS.md#fl-41), [FL-43](AUTOMATED_TEST_RESULTS.md#fl-43), [FL-44](AUTOMATED_TEST_RESULTS.md#fl-44), [FL-45](AUTOMATED_TEST_RESULTS.md#fl-45), [FL-46](AUTOMATED_TEST_RESULTS.md#fl-46), [FL-47](AUTOMATED_TEST_RESULTS.md#fl-47), [FL-48](AUTOMATED_TEST_RESULTS.md#fl-48), [FL-49](AUTOMATED_TEST_RESULTS.md#fl-49), [FL-56](AUTOMATED_TEST_RESULTS.md#fl-56) | Mới asset/widget/timer; chưa kiểm tra thị giác/cutout và trải nghiệm cả web/mobile. |
| TANK-13 | P1 W/M | Thiết bị active→inactive→active → nạp telemetry | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| DATA-01 | P1 B/I/W/M | MAC active của A1 → gửi SENSOR trên topic telemetry test | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| DATA-02 | P1 B/I | Gửi JSON hỏng, thiếu mac/readings hoặc không có sensor được hỗ trợ | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| DATA-03 | P0 B/I | Gửi dữ liệu từ MAC chưa đăng ký hoặc inactive | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| DATA-04 | P0 B/I | Gửi từng sensor thiếu, null, chuỗi, NaN biểu diễn dạng chuỗi, giá trị ngoài miền vật lý | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| DATA-05 | P1 B/W/M | Chạy BOUNDS: đúng min/max tốt, ngay ngoài; đúng biên warn, ngay ngoài; giữ các sensor khác tốt | **CHƯA HOÀN TẤT** | [FL-08](AUTOMATED_TEST_RESULTS.md#fl-08), [FL-09](AUTOMATED_TEST_RESULTS.md#fl-09) | Chỉ Flutter với giá trị mẫu; chưa đủ biên và đồng nhất backend/web. |
| DATA-06 | P1 B/W/M | Gán SPECIES → lần lượt đưa giá trị vào các dải tốt/warn/danger | **CHƯA HOÀN TẤT** | [FL-08](AUTOMATED_TEST_RESULTS.md#fl-08), [FL-09](AUTOMATED_TEST_RESULTS.md#fl-09) | Chỉ Flutter với giá trị mẫu; chưa đủ biên và đồng nhất backend/web. |
| DATA-07 | P1 B/W/M | Loài thiếu/null/min≥max hoặc truy vấn loài lỗi | **CHƯA HOÀN TẤT** | [FL-10](AUTOMATED_TEST_RESULTS.md#fl-10) | Mới thiếu loài; chưa null,min≥max,lỗi truy vấn và các nền tảng. |
| DATA-08 | P0 B/W/M | Các số tốt nhưng pin5=0; sau đó pin5=1 | **CHƯA HOÀN TẤT** | [FL-13](AUTOMATED_TEST_RESULTS.md#fl-13) | Mới ưu tiên trạng thái khiên; chưa telemetry,phục hồi và chuyển bể thực tế. |
| DATA-09 | P1 W/M/D | Một sensor warn, một danger → khôi phục lần lượt → chuyển bể | **CHƯA HOÀN TẤT** | [FL-13](AUTOMATED_TEST_RESULTS.md#fl-13) | Mới ưu tiên trạng thái khiên; chưa telemetry,phục hồi và chuyển bể thực tế. |
| DATA-10 | P1 W/M | Lịch sử rỗng, một điểm, nhiều điểm; đổi sensor/khoảng thời gian/bể | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| DATA-11 | P1 W/M/D | Mất mạng Realtime → nhận dữ liệu khi offline → kết nối lại | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| DATA-12 | P1 B/I | Thiết bị đang simulator → telemetry thật tới → chờ chu kỳ simulator tiếp | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ALERT-01 | P1 B/D | Gửi một telemetry bất thường khi tắt các kênh gửi | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ALERT-02 | P1 B/W/M | Lưu lần lượt none, critical_only, warning_only và chế độ toàn bộ → phát warn/danger | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ALERT-03 | P1 B | Cùng lúc một warn và một danger với warning_only | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ALERT-04 | P1 B | Có nhiều sensor bất thường cùng mẫu | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ALERT-05 | P1 B/D | Phát lặp trước, đúng và sau cooldown | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ALERT-06 | P1 W/M/B | Bật riêng email, riêng web, riêng app rồi cả ba | **CHƯA HOÀN TẤT** | [BE-06](AUTOMATED_TEST_RESULTS.md#be-06), [BE-07](AUTOMATED_TEST_RESULTS.md#be-07) | Chỉ Brevo fake fetch; chưa cấu hình kênh,FCM,SMTP,token,cooldown và gửi thật. |
| ALERT-07 | P1 B | Email lỗi nhưng FCM thành công; không có email/token; token hết hạn | **CHƯA HOÀN TẤT** | [BE-06](AUTOMATED_TEST_RESULTS.md#be-06), [BE-07](AUTOMATED_TEST_RESULTS.md#be-07) | Chỉ Brevo fake fetch; chưa cấu hình kênh,FCM,SMTP,token,cooldown và gửi thật. |
| ALERT-08 | P0 W/M/D | A đăng xuất, B đăng nhập cùng máy → phát cảnh báo A | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ALERT-09 | P1 W/M | Từ chối quyền push, rồi bật lại; nhận push foreground/background | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ALERT-10 | P1 W/M | Lọc lịch sử cảnh báo theo bể/mức/thời gian; không có kết quả; dữ liệu lớn | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| RELAY-01 | P0 W/M/B/I | Mỗi relay ban đầu OFF → bấm ON → đối chiếu API, MQTT, DB, tải | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| RELAY-02 | P0 W/M/B/I | Mỗi relay ban đầu ON → bấm OFF → đối chiếu các lớp | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| RELAY-03 | P0 W/M/I | Điều khiển A1 rồi đổi A2; giữ B1 kết nối | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| RELAY-04 | P1 W/M/B | Bấm nhanh cùng nút nhiều lần lúc request pending | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| RELAY-05 | P0 W/M | Gửi lệnh A1 → đổi A2 trước phản hồi; đẩy Realtime A1 cũ | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| RELAY-06 | P0 W/M/B/I | MQTT mất kết nối hoặc thiết bị offline → điều khiển | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| RELAY-07 | P0 B/D/I | Publish thành công nhưng update DB lỗi → thử lại từ UI | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| RELAY-08 | P1 W/M | API treo quá timeout rồi trả muộn | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| RELAY-09 | P0 W/M/D | Hai máy cùng điều khiển một relay với ý định trái nhau | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SCH-01 | P1 W/M/D | Tạo lịch một lần ngày tương lai ON08:00/OFF09:00 | **CHƯA HOÀN TẤT** | [FL-59](AUTOMATED_TEST_RESULTS.md#fl-59) | Mới payload mobile mock; chưa reload,DB đã drop cột và worker. |
| SCH-02 | P1 W/M/B | Tạo lịch hàng ngày ON08:00/OFF09:00 → giả lập hai ngày | **CHƯA HOÀN TẤT** | [BE-09](AUTOMATED_TEST_RESULTS.md#be-09) | Mới lịch daily Light ON hai ngày; chưa UI,DB thật,OFF và restart. |
| SCH-03 | P0 B/I | Lịch đến hạn của từng relay → kiểm tra payload và tải | **CHƯA HOÀN TẤT** | [BE-08](AUTOMATED_TEST_RESULTS.md#be-08), [BE-12](AUTOMATED_TEST_RESULTS.md#be-12) | Mới once ON Pump bằng fake MQTT/DB; chưa đủ relay,OFF,restart và tải thật. Mới retry update DB sau OFF Aerator; chưa các lỗi publish,log,schedule và tải thật. |
| SCH-04 | P1 B/D | Worker tick nhiều lần cùng phút và sau restart | **CHƯA HOÀN TẤT** | [BE-08](AUTOMATED_TEST_RESULTS.md#be-08), [BE-09](AUTOMATED_TEST_RESULTS.md#be-09) | Mới once ON Pump bằng fake MQTT/DB; chưa đủ relay,OFF,restart và tải thật. Mới lịch daily Light ON hai ngày; chưa UI,DB thật,OFF và restart. |
| SCH-05 | P1 W/M/B | Lịch một lần ON23:59/OFF00:01 → qua nửa đêm | **CHƯA HOÀN TẤT** | [BE-10](AUTOMATED_TEST_RESULTS.md#be-10), [WEB-03](AUTOMATED_TEST_RESULTS.md#web-03) | Mới hàm tính thời gian qua ngày; chưa trọn luồng lưu,ON/OFF,hoàn tất và thiết bị. |
| SCH-06 | P1 B | ON=OFF ở lịch một lần; lặp lại với daily | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SCH-07 | P1 B | Lịch once chỉ ON; lịch once chỉ OFF → đến hạn | **CHƯA HOÀN TẤT** | [BE-08](AUTOMATED_TEST_RESULTS.md#be-08) | Mới once ON Pump bằng fake MQTT/DB; chưa đủ relay,OFF,restart và tải thật. |
| SCH-08 | P1 W/M/D | Cả hai giờ trống, giờ sai, daily có date, once thiếu date → lưu/UI hoặc request | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SCH-09 | P0 D/W/M | Hai phiên cùng tạo lịch active cho cùng device/relay | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SCH-10 | P1 W/M/B | Sửa giờ/ngày; tắt lịch trước hạn; bật lại; xóa lịch qua UI | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SCH-11 | P1 B | Once chạy trễ1,2,3 phút; daily chạy trễ1 phút | **CHƯA HOÀN TẤT** | [BE-11](AUTOMATED_TEST_RESULTS.md#be-11) | Mới once trễ1/3 phút và ngày sau; chưa mốc2 phút và daily trễ. |
| SCH-12 | P0 B/I | Thiết bị inactive, mất tank_id hoặc MAC → lịch đến hạn | **CHƯA HOÀN TẤT** | [BE-13](AUTOMATED_TEST_RESULTS.md#be-13) | Mới inactive/disconnected MQTT; chưa mất tank/MAC,reconnect,DB outage và server chạy thật. |
| SCH-13 | P1 B/D | Relay đã đúng trạng thái trước mốc lịch | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SCH-14 | P0 B/D | Publish lỗi, update state lỗi, insert log lỗi, update schedule lỗi — từng lỗi riêng | **CHƯA HOÀN TẤT** | [BE-12](AUTOMATED_TEST_RESULTS.md#be-12) | Mới retry update DB sau OFF Aerator; chưa các lỗi publish,log,schedule và tải thật. |
| SCH-15 | P0 B | Hai worker local và staging cùng chạy fixture một lịch | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SCH-16 | P1 B | Server UTC; lịch Việt Nam; cuối tháng/năm, 29/02 năm nhuận | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SCH-17 | P0 W/M/B/D | DB test đã drop sáu cột legacy → mở/sửa lịch/điều khiển/restart worker | **CHƯA HOÀN TẤT** | [FL-59](AUTOMATED_TEST_RESULTS.md#fl-59) | Mới payload mobile mock; chưa reload,DB đã drop cột và worker. |
| SCH-18 | P1 D | Trên DB test: áp migration theo thứ tự cũ→drop; thử dựng DB mới | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-01 | P1 W | Thêm V1/V3, thêm lặp V1, đổi số lượng, xóa; reload | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-02 | P1 W | Số lượng0/âm/rất lớn/không nguyên; checkout giỏ rỗng | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-03 | P1 W/D | Khách chưa login đặt COD đủ thông tin | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-04 | P1 W/D | A đặt hàng, sửa địa chỉ giao khác địa chỉ cũ | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-05 | P1 W | Thiếu tên/phone/email/address, phone/email sai; note60 và61 từ | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-06 | P0 W/D | Bấm đặt hai lần hoặc retry khi response chậm | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-07 | P0 W/D | Insert orders thành công, insert order_items thất bại | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-08 | P0 W/D | Sửa giá, total_price, product_id, user_id/status trong request test | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-09 | P1 W | Chọn chuyển khoản → xem QR và xác nhận | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-10 | P0 W/D | A mở lịch sử/chi tiết đơn; thử ID đơn B và khách vãng lai | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SHOP-11 | P1 W | Mở catalog gói cước có/rỗng/lỗi dữ liệu | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SUP-01 | P1 W/D | Guest và A gửi hỗ trợ đủ tên/email/nội dung; phone/address tùy chọn | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SUP-02 | P1 W | Bỏ trường bắt buộc; email sai; gửi lặp; DB lỗi | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SUP-03 | P0 W/D | Tra lịch sử theo email A bằng guest, B; gọi RPC trực tiếp | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SUP-04 | P1 W/D | Insert hỗ trợ lỗi UUID → nhánh retry bỏ user_id | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-01 | P0 W/M/D | Đăng nhập từng role staff → mở các tab và thử truy vấn task loại khác | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-02 | P1 W/M | Task todo chưa giao → nhận → hoàn thành | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-03 | P0 W/M/D | Hai nhân viên cùng nhận một task chưa giao | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-04 | P0 W/M/D | Nhân viên B thao tác task đã giao A hoặc sửa status trực tiếp | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-05 | P1 W/M/D | Admin duyệt đơn pending | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-06 | P0 W/M/D | Hai admin duyệt cùng đơn; duyệt lại đơn đã confirmed | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-07 | P1 W/M/D | Đóng gói đơn có nhiều item và quantity>1, dùng MAC đúng version còn rảnh | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-08 | P0 W/M/D | Thiếu MAC; trùng MAC khác hoa/thường/khoảng trắng; MAC không tồn tại | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-09 | P0 W/M/D | MAC active/đã ghép bể hoặc version khác sản phẩm | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-10 | P0 W/M/D | Hai đơn cùng đóng gói một MAC rảnh | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-11 | P0 W/M/D | Lỗi giữa cập nhật items, active device, done task, tạo delivery | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-12 | P1 W/M/D | Shipper hoàn tất delivery_install | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-13 | P1 W/M/D | Support trả lời phiếu → khách xem lịch sử | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-14 | P1 W/M/D | Chuyển phiếu sang bảo trì; có/không có đơn trước theo email/phone | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| STAFF-15 | P1 W/M | Lịch sử rỗng/nhiều task; task_type legacy giao/lắp/bảo trì | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-01 | P1 W/M | Thêm loài → sửa ngưỡng → tìm kiếm → xóa loài chưa dùng | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-02 | P1 W/M/D | Loài tên trùng/trống; min=max/min>max; pH ngoài0–14; dữ liệu không số | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-03 | P0 W/M/D | Xóa loài đang gắn bể | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-04 | P1 W/M | Thêm MAC theo dòng/dấu phẩy, có khoảng trắng và hoa/thường | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-05 | P0 W/M/D | Batch có MAC trùng nội bộ/trùng DB và một phần hợp lệ | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-06 | P0 W/M/D | Sửa MAC thành MAC đã có; xóa thiết bị đang có bể/lịch/đơn | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-07 | P1 W/M | Tra người mua từ thiết bị đã giao/chưa giao | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-08 | P0 W/M/D | Admin tạo staff đầy đủ; ngay sau đó kiểm tra session admin | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-09 | P1 W/M | Tạo staff thiếu trường/trùng phone/email; sửa tên/phone/role | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-10 | P0 W/M/D | Xóa staff rồi thử token cũ và đăng nhập lại bằng Auth còn tồn tại | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-11 | P1 W/M | Thêm gói: giá/thời hạn/max_tanks/history_days/setup; trên mobile sửa/xóa | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-12 | P1 W/M | Gói tên rỗng, giá âm, thời hạn0/âm, giới hạn không nguyên | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| ADM-13 | P1 W/M | Tìm/lọc đơn theo trạng thái, xem chi tiết item/MAC | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-01 | P0 B/W/M | Nạp REV vào năm quá khứ → mở bảng/line chart | **CHƯA HOÀN TẤT** | [BE-01](AUTOMATED_TEST_RESULTS.md#be-01) | Test hàm dùng bộ số liệu khác; chưa chạy đủ dữ liệu REV/VERSION và cả giao diện web/mobile. |
| REV-02 | P0 B/W/M | Đối chiếu growth T1/T2/T3/T4/T5 của REV | **CHƯA HOÀN TẤT** | [BE-01](AUTOMATED_TEST_RESULTS.md#be-01) | Test hàm dùng bộ số liệu khác; chưa chạy đủ dữ liệu REV/VERSION và cả giao diện web/mobile. |
| REV-03 | P0 B/W/M | Đối chiếu MA3 của REV T1–T4 | **CHƯA HOÀN TẤT** | [BE-01](AUTOMATED_TEST_RESULTS.md#be-01) | Test hàm dùng bộ số liệu khác; chưa chạy đủ dữ liệu REV/VERSION và cả giao diện web/mobile. |
| REV-04 | P0 B/W/M | REV → xem tổng và Điểm nổi bật | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-05 | P1 B/W/M | Hai tháng cùng doanh thu cao nhất; chỉ tăng; chỉ giảm; cả năm0 | **CHƯA HOÀN TẤT** | [BE-02](AUTOMATED_TEST_RESULTS.md#be-02) | Mới kiểm tra dữ liệu rỗng; chưa đủ đồng hạng, chỉ tăng/giảm và các biến thể thời gian. |
| REV-06 | P0 B/W/M | Đơn created T1 nhưng delivered T3; thêm pending/confirmed/shipping/cancelled | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-07 | P0 B/D | Đơn ở hai mốc CLOCK và ranh giới mỗi tháng | **CHƯA HOÀN TẤT** | [BE-03](AUTOMATED_TEST_RESULTS.md#be-03) | Mới kiểm tra hàm với fixture; chưa truy vấn database và đối chiếu UI. |
| REV-08 | P1 W/M/B | Chọn năm quá khứ/năm hiện tại → đổi nhanh năm nhiều lần khi mạng chậm | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-09 | P1 B | annual không truyền year; year=1999, năm tương lai, abc,2026.5, tham số lặp | **CHƯA HOÀN TẤT** | [BE-05](AUTOMATED_TEST_RESULTS.md#be-05) | Mới thử year hợp lệ/banana và quyền; chưa đủ mặc định,1999,năm tương lai,số thập phân,tham số lặp. |
| REV-10 | P1 B/W/M | Năm hiện tại đang T10, không có dữ liệu T7–T12 | **CHƯA HOÀN TẤT** | [BE-02](AUTOMATED_TEST_RESULTS.md#be-02), [FL-39](AUTOMATED_TEST_RESULTS.md#fl-39) | Mới kiểm tra dữ liệu rỗng; chưa đủ đồng hạng, chỉ tăng/giảm và các biến thể thời gian. Mới hiển thị fixture rỗng/thiếu tháng; chưa API và năm hiện tại đầy đủ. |
| REV-11 | P0 B | Seed501 và1001 đơn delivered, có created_at trùng | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-12 | P0 B/W/M | VERSION → lọc đúng tháng/năm | **CHƯA HOÀN TẤT** | [BE-01](AUTOMATED_TEST_RESULTS.md#be-01) | Test hàm dùng bộ số liệu khác; chưa chạy đủ dữ liệu REV/VERSION và cả giao diện web/mobile. |
| REV-13 | P0 B | Tổng đơn100đ; ba item cùng subtotal thuộc V1/V2/V3 | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-14 | P1 B/W/M | Có item product_id ngoàiV1–V4, item subtotal≤0, đơn total âm/không hợp lệ | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-15 | P1 W/M | Đổi tháng rồi năm ở bảng version, có tháng rỗng | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-16 | P2 W/M | Version revenue khác nhau, đồng hạng thấp/cao, toàn0 | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-17 | P1 W/M/B | API404/401/403/500, timeout → khôi phục → Thử lại | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-18 | P1 B/W/M | Kiểm tra KPI đơn pending/packing/shipping; devices assigned; staff;4 đơn gần nhất | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| REV-19 | P1 B/W/M | Các đơn quanh ranh giới tháng; xem7/30 ngày và tăng trưởng tháng | **CHƯA HOÀN TẤT** | [BE-03](AUTOMATED_TEST_RESULTS.md#be-03) | Mới kiểm tra hàm với fixture; chưa truy vấn database và đối chiếu UI. |
| REV-20 | P2 W/M | Mobile320/360/390px, chữ lớn, light/dark → mở từng tháng và filter năm/tháng | **CHƯA HOÀN TẤT** | [FL-06](AUTOMATED_TEST_RESULTS.md#fl-06), [FL-07](AUTOMATED_TEST_RESULTS.md#fl-07), [FL-11](AUTOMATED_TEST_RESULTS.md#fl-11), [FL-16](AUTOMATED_TEST_RESULTS.md#fl-16), [FL-18](AUTOMATED_TEST_RESULTS.md#fl-18), [FL-20](AUTOMATED_TEST_RESULTS.md#fl-20), [FL-23](AUTOMATED_TEST_RESULTS.md#fl-23), [FL-32](AUTOMATED_TEST_RESULTS.md#fl-32) | Mới layout widget ở các độ rộng/theme; chưa web,tooltip,filter và mở từng tháng. |
| SEC-01 | P0 B | GET admin dashboard/annual không token, token sai/hết hạn, token A, token admin | **CHƯA HOÀN TẤT** | [BE-04](AUTOMATED_TEST_RESULTS.md#be-04), [BE-05](AUTOMATED_TEST_RESULTS.md#be-05) | HTTP loopback với Auth giả lập; chưa token hết hạn và quyền trên môi trường thật. |
| SEC-02 | P0 B/I | POST relay/command không token, token A với tank B1 | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SEC-03 | P0 B/D | Relay payload state chuỗi/null, pin ngoài1–3, relay_field ngoài danh sách hoặc không khớp pin | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SEC-04 | P0 D | Với A: đọc/sửa/xóa tanks, devices, telemetry, alerts, relay_logs của B qua Data API | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SEC-05 | P0 D | A insert/update device_schedules cho B; đổi device_id của lịch A sang B | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SEC-06 | P0 D | Khách/staff tự update users.role; sửa user_id của bể/đơn; sửa giá và trạng thái đơn | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SEC-07 | P0 D | Guest/A gọi RPC lịch sử support; truy vấn view nếu được expose | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SEC-08 | P0 W/M/B | Kiểm tra bundle/APK/config công khai và lỗi runtime | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SEC-09 | P1 W/D | Lưu chuỗi chứa HTML/script vô hại vào tên bể/support/note → hiển thị các role | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SEC-10 | P1 B | Request từ origin local/staging hợp lệ và origin ngoài allowlist; OPTIONS | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SEC-11 | P1 W/B | Đọc response hosting test cho env/git/source-map/debug và header HTTPS | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| SEC-12 | P1 W/M/B | Lặp đăng nhập/support/checkout bằng số lượng giới hạn trong môi trường test | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| OPS-01 | P1 W/M/B | Dev web qua Vite proxy; Android emulator; AQUACARE_API_URL override; cấu hình release | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| OPS-02 | P1 W/M/B | Backend chưa chạy, khởi động chậm hoặc restart → mở màn có API | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| OPS-03 | P0 B | MQTT mất→kết nối lại; DB mất→phục hồi; worker tick đang xử lý | **CHƯA HOÀN TẤT** | [BE-13](AUTOMATED_TEST_RESULTS.md#be-13) | Mới inactive/disconnected MQTT; chưa mất tank/MAC,reconnect,DB outage và server chạy thật. |
| OPS-04 | P1 B | Thiếu từng biến môi trường bắt buộc trong bản test → khởi động | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| OPS-05 | P2 W/M | Toàn màn chính ở light/dark, keyboard mở, font lớn, portrait/landscape | **CHƯA HOÀN TẤT** | [FL-06](AUTOMATED_TEST_RESULTS.md#fl-06), [FL-07](AUTOMATED_TEST_RESULTS.md#fl-07), [FL-11](AUTOMATED_TEST_RESULTS.md#fl-11), [FL-16](AUTOMATED_TEST_RESULTS.md#fl-16), [FL-18](AUTOMATED_TEST_RESULTS.md#fl-18), [FL-20](AUTOMATED_TEST_RESULTS.md#fl-20), [FL-23](AUTOMATED_TEST_RESULTS.md#fl-23), [FL-24](AUTOMATED_TEST_RESULTS.md#fl-24), [FL-25](AUTOMATED_TEST_RESULTS.md#fl-25), [FL-26](AUTOMATED_TEST_RESULTS.md#fl-26), [FL-27](AUTOMATED_TEST_RESULTS.md#fl-27), [FL-29](AUTOMATED_TEST_RESULTS.md#fl-29), [FL-30](AUTOMATED_TEST_RESULTS.md#fl-30), [FL-31](AUTOMATED_TEST_RESULTS.md#fl-31), [FL-32](AUTOMATED_TEST_RESULTS.md#fl-32), [FL-33](AUTOMATED_TEST_RESULTS.md#fl-33), [FL-34](AUTOMATED_TEST_RESULTS.md#fl-34), [FL-36](AUTOMATED_TEST_RESULTS.md#fl-36), [FL-37](AUTOMATED_TEST_RESULTS.md#fl-37), [FL-38](AUTOMATED_TEST_RESULTS.md#fl-38), [FL-40](AUTOMATED_TEST_RESULTS.md#fl-40), [FL-41](AUTOMATED_TEST_RESULTS.md#fl-41), [FL-42](AUTOMATED_TEST_RESULTS.md#fl-42), [FL-43](AUTOMATED_TEST_RESULTS.md#fl-43), [FL-44](AUTOMATED_TEST_RESULTS.md#fl-44), [FL-45](AUTOMATED_TEST_RESULTS.md#fl-45), [FL-46](AUTOMATED_TEST_RESULTS.md#fl-46), [FL-47](AUTOMATED_TEST_RESULTS.md#fl-47), [FL-48](AUTOMATED_TEST_RESULTS.md#fl-48), [FL-49](AUTOMATED_TEST_RESULTS.md#fl-49), [FL-51](AUTOMATED_TEST_RESULTS.md#fl-51), [FL-52](AUTOMATED_TEST_RESULTS.md#fl-52), [FL-60](AUTOMATED_TEST_RESULTS.md#fl-60), [FL-61](AUTOMATED_TEST_RESULTS.md#fl-61), [FL-63](AUTOMATED_TEST_RESULTS.md#fl-63), [FL-64](AUTOMATED_TEST_RESULTS.md#fl-64), [FL-65](AUTOMATED_TEST_RESULTS.md#fl-65), [FL-66](AUTOMATED_TEST_RESULTS.md#fl-66), [FL-67](AUTOMATED_TEST_RESULTS.md#fl-67), [FL-68](AUTOMATED_TEST_RESULTS.md#fl-68), [FL-69](AUTOMATED_TEST_RESULTS.md#fl-69), [FL-70](AUTOMATED_TEST_RESULTS.md#fl-70), [FL-71](AUTOMATED_TEST_RESULTS.md#fl-71), [FL-72](AUTOMATED_TEST_RESULTS.md#fl-72), [FL-73](AUTOMATED_TEST_RESULTS.md#fl-73), [FL-74](AUTOMATED_TEST_RESULTS.md#fl-74) | Nhiều widget mobile đã kiểm tra kích thước; chưa toàn bộ màn,web,keyboard,landscape và thiết bị thật. |
| OPS-06 | P2 W | Keyboard Tab/Enter/Escape trên login, modal bể, bộ lọc,404; icon-only button | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| OPS-07 | P1 W/M | Đổi tab/bể và vào/ra dashboard20 lần trong dữ liệu test | **CHƯA HOÀN TẤT** | [FL-56](AUTOMATED_TEST_RESULTS.md#fl-56) | Mới dispose timer slideshow; chưa chuyển tab/bể20 lần và đếm subscription/request. |
| OPS-08 | P1 W/M/B | Dữ liệu lịch sử lớn và501+ đơn → đo thời gian tải/bộ nhớ | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| OPS-09 | P1 W | Deploy thử staging → mở deep link và tải asset/APK/manifest | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| OPS-10 | P0 W/M/B/D | Luồng đầy đủ: guest đặt hàng → admin duyệt → kho gán MAC → shipper giao → A ghép bể → telemetry → điều khiển → lịch → cảnh báo | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |
| OPS-11 | P0 W/M/B/D | Luồng cách ly: A và B thực hiện đồng thời thao tác bể/thiết bị/đơn | **CHƯA CHẠY** | — | Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc. |

Expected result đầy đủ của từng ID ở [đặc tả hệ thống](../../AQUACARE_SYSTEM_TEST_CASES.md). Các ca chưa chạy vẫn là công việc cần làm; không suy ra hệ thống không có bug từ kết quả bộ test hiện hữu.
