# Bộ kiểm thử core AquaCare

Chạy từ thư mục gốc (Docker Desktop phải đang mở):

- `RUN_CORE_TESTS.cmd`: 21 bài backend unit, 76 bài Flutter widget và toàn bộ 47 bài Playwright web trên Supabase local (tổng 144 bài).
- `RUN_CORE_TESTS_USB.cmd`: như trên, thêm một bài Flutter integration trực tiếp trên điện thoại Android cắm USB với flavor QA.
- `RUN_CORE_TESTS_DEMO.cmd`: như bản USB, nhưng toàn bộ 47 bài Playwright tự động mở cửa sổ Chrome để hội đồng xem thao tác web. Bài Flutter chạy trên điện thoại thật; có thể dùng scrcpy để chiếu màn hình điện thoại. Không cần bấm Run trong Playwright UI.

Bộ này giữ cả những bài đang FAIL để lỗi hiện rõ khi chạy lại. Playwright kiểm tra giao diện web, đơn hàng, backend, quyền truy cập và dữ liệu local. Bài Flutter USB hiện chỉ kiểm tra màn hình đăng nhập và validation; chưa bao phủ luồng đăng nhập, tạo bể hoặc relay trên điện thoại.

Kết quả riêng: `test-results/core-results.md`. Log Playwright: `test-results/playwright-html/index.html` và `test-results/playwright.json`. Kế hoạch 196 ca vẫn nằm trong `AQUACARE_SYSTEM_TEST_CASES.md` cùng addendum; các ca chưa tự động hóa không được tính PASS.

Runner kiểm tra Supabase local tại `127.0.0.1:54321`, 19 bảng dự kiến, nạp fixture tổng hợp, đặt email/FCM thành giá trị vô hiệu và dùng backend cổng 5051. Nếu kiểm tra môi trường thất bại, runner dừng trước khi chạy bài có ghi dữ liệu.
