# Bộ kiểm thử core AquaCare

Chạy từ thư mục gốc (Docker Desktop phải đang mở):

- `RUN_CORE_TESTS.cmd`: 21 bài backend unit, 76 bài Flutter widget và 44 bài Playwright web trên Supabase local (tổng 141 bài); không cần USB.
- `RUN_CORE_TESTS_USB.cmd`: như trên, thêm 12 bài Flutter integration trực tiếp trên điện thoại Android cắm USB với flavor QA (tổng 153 bài).
- `RUN_CORE_TESTS_DEMO.cmd`: như bản USB, nhưng 44 bài Playwright tự động mở cửa sổ Chrome để hội đồng xem thao tác web. Bài Flutter chạy trên điện thoại thật; có thể dùng scrcpy để chiếu màn hình điện thoại. Không cần bấm Run trong Playwright UI.

Playwright kiểm tra giao diện web, đơn hàng, backend, quyền truy cập và dữ liệu local. Mười hai bài Flutter USB kiểm tra giao diện admin/staff, form đăng nhập, hiện/ẩn mật khẩu, validation tên và thể tích bể, chọn loài cá, quay lại bước trước và bước thiết bị; không ghi dữ liệu. Chưa thực hiện đăng nhập, tạo bể hoặc điều khiển relay thật trên điện thoại.

Kết quả tổng hợp từng ca: `test-results/core-results.html`, có STT, bộ lọc nhóm/trạng thái và tìm kiếm. File này được tạo sau mỗi lần chạy core, kể cả khi một nhóm test thất bại; chỉ liệt kê các ca thật sự có kết quả. Kết quả tóm tắt: `test-results/core-results.md`. Log Playwright: `test-results/playwright-html/index.html` và `test-results/playwright.json`. Kế hoạch 196 ca vẫn nằm trong `AQUACARE_SYSTEM_TEST_CASES.md` cùng addendum; các ca chưa tự động hóa không được tính PASS.

Runner kiểm tra Supabase local tại `127.0.0.1:54321`, 19 bảng dự kiến, nạp fixture tổng hợp, đặt email/FCM thành giá trị vô hiệu và dùng backend cổng 5051. Nếu kiểm tra môi trường thất bại, runner dừng trước khi chạy bài có ghi dữ liệu.
