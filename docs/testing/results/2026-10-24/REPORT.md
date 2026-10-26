# Kết quả kiểm thử AquaCare — 24/10/2026

Đã chạy các bộ test tự động hiện có trong working tree. **90 test PASS, 0 FAIL**; web build thành công. Đây không phải kết quả PASS của toàn bộ178 test case trong tài liệu hệ thống.

**Bảng theo dõi:** [Trạng thái đầy đủ178 test case](TEST_CASE_STATUS.md) · [Kết quả từng test trong90 test tự động](AUTOMATED_TEST_RESULTS.md).

Đối chiếu từng ca: **0 ca hệ thống được xác nhận Pass toàn bộ,0 Fail được xác nhận,41 ca có bằng chứng một phần nhưng chưa hoàn tất,137 ca chưa chạy**. Kết quả90 test tự động không được cộng vào178 như hai tập tương ứng1:1.

## Môi trường và phạm vi

- Windows, Node v24.16.0, Flutter3.44.2, Dart3.12.2.
- Git HEAD: `80a8ba53169709744b72c580fefb1006d160c64d`.
- Working tree có thay đổi trước đợt chạy tại backend `server.js`, `timer_worker.js` và `test/timer_worker.test.js` cho relay active-low. Kết quả thuộc working tree này, không chỉ commit HEAD.
- Backend test dùng fake Supabase/MQTT, HTTP server loopback và fake email fetch. Không boot server.js production.
- Flutter dùng môi trường widget test và HTTP mock. Không chạy APK trên thiết bị thật.
- Không ghi dữ liệu DB đang sử dụng, không gửi email thật, không điều khiển relay thật; không push/deploy/release.

## Kết quả thực thi

| Bộ | Lệnh đã chạy từ thư mục tương ứng | PASS | FAIL | Exit code | Bằng chứng |
|---|---|---:|---:|---:|---|
| Backend | `node --test --test-reporter=tap test/*.test.js` | 13 | 0 | 0 | [backend.tap](backend.tap) |
| Web logic | `node --test --test-reporter=tap tests/*.test.mjs` | 3 | 0 | 0 | [web.tap](web.tap) |
| Flutter | `flutter test --no-pub --reporter json` | 74 | 0 | 0 | [flutter.jsonl](flutter.jsonl), [danh sách kết quả](flutter-results.json) |
| Web build | `npm.cmd run build` | Không tính vào số test | — | 0 | [web-build.log](web-build.log) |

Flutter đếm các sự kiện testDone không hidden, không cộng các sự kiện load/setup/teardown vào74 test.

| File Flutter | Số test PASS |
|---|---:|
| admin_revenue_panels_test.dart | 9 |
| app_version_gate_test.dart | 5 |
| auth_ui_test.dart | 6 |
| responsive_layout_test.dart | 16 |
| species_thresholds_test.dart | 3 |
| tank_overview_hero_test.dart | 23 |
| widget_test.dart | 12 |

## Ý nghĩa đối với bộ178 test case

Các nhóm dưới đây được kiểm chứng **một phần ở mức tự động**. Không đánh cả nhóm hoặc cả test case hệ thống là Pass nếu test hiện có chưa thực hiện đủ bước/biến thể.

| Nhóm liên quan | Bằng chứng hiện có | Phần chưa kiểm chứng |
|---|---|---|
| REV, SEC-01 | Logic doanh thu/tháng Việt Nam/phân bổ version; route admin với auth giả lập; widget doanh thu | Query DB thật, RLS, dữ liệu501+ đơn, đầy đủ input biên, browser E2E |
| SCH | Lịch once/daily, qua nửa đêm, trễ, retry DB, inactive/disconnected; preset giờ trên web | Hai worker, DB/MQTT thật, migration, đầy đủ biến thể lịch và tải vật lý |
| ALERT | Gửi Brevo thành công/thất bại qua fake fetch | Provider thật, FCM, cooldown và cảnh báo toàn luồng |
| UPD | Màn gate trong widget test | APK release thật, manifest hosting, browser tải APK và resume trên thiết bị |
| DATA | Ngưỡng loài trong Flutter | Telemetry MQTT, phân loại backend/web và Realtime toàn luồng |
| AUTH, NAV, TANK, OPS | Widget auth/splash/onboarding, responsive và hero | Đăng nhập/OAuth thật, CRUD, cách ly tài khoản, thiết bị và browser thật |

**Chưa thực hiện:** toàn bộ các bước hệ thống cần tài khoản fixture/DB test, kiểm thử bảo mật trực tiếp, checkout/nhân viên/admin ghi dữ liệu, Playwright E2E, thử tải, gửi notification thật và xác minh relay vật lý. Checkout hiện chưa có bộ fixture tích hợp/E2E hoàn chỉnh cho178 ca. Cần chuẩn bị môi trường test riêng và bộ thiết bị thử để tiếp tục các ca này; không dùng90 kết quả trên thay thế chúng.

## Cảnh báo

- Web build báo chunk sau minify lớn hơn500kB và cảnh báo thời gian plugin. Build vẫn exit0; đây là vấn đề cần đánh giá hiệu năng, chưa phải một test chức năng FAIL.
- `AquaCare_Backend/package.json` hiện để `npm test` là lệnh placeholder báo lỗi. Đợt này chạy đúng các file test qua Node test runner, không dùng script placeholder.
- Chưa đo coverage; số90 PASS không có nghĩa90% hay100% coverage.

Không thay đổi assertion hoặc mã ứng dụng để làm test Pass.
