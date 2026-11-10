# Bộ kiểm thử core AquaCare

Chạy từ thư mục gốc (Docker Desktop phải đang mở):

- `RUN_CORE_TESTS.cmd`: 24 bài backend unit, 76 bài Flutter widget và 42 bài Playwright web trên Supabase local (tổng 142 bài); không cần USB.
- `RUN_CORE_TESTS_USB.cmd`: như trên, thêm 40 bài Flutter integration trực tiếp trên điện thoại Android cắm USB với flavor QA (tổng 182 bài).
- `RUN_CORE_TESTS_DEMO.cmd`: như bản USB, nhưng 42 bài Playwright tự động mở cửa sổ Chrome để hội đồng xem thao tác web. Bài Flutter chạy trên điện thoại thật; có thể dùng scrcpy để chiếu màn hình điện thoại. Không cần bấm Run trong Playwright UI.

Playwright kiểm tra giao diện web, đơn hàng, backend, quyền truy cập và dữ liệu local. Bốn mươi bài Flutter USB kiểm tra giao diện admin/staff, form đăng nhập, đăng ký, đặt lại mật khẩu, hiện/ẩn mật khẩu, validation tên và thể tích bể, chọn loài cá, quay lại bước trước, bước thiết bị và validation loài cá trong admin; không ghi dữ liệu. Chưa thực hiện đăng nhập, tạo bể hoặc điều khiển relay thật trên điện thoại.

`FULFILL-01` thao tác trên web qua các tài khoản QA riêng: admin duyệt đơn, nhân viên kho nhập MAC và đóng gói, shipper nhận và hoàn tất giao hàng, khách chọn MAC để tạo bể. Đơn hàng phần cứng được tạo làm fixture trong Supabase local vì giao diện hiện không cho mua sản phẩm Coming Soon. Bước email dùng bộ gửi giả lập để kiểm tra địa chỉ, MAC và trạng thái đã gửi; không kiểm tra email thật đến hộp thư. Bài test lưu ảnh ở `test-results/evidence/FULFILL-01/` và xóa dữ liệu tổng hợp khi kết thúc.

Kết quả tổng hợp từng ca: `test-results/core-results.html`, có STT, bộ lọc nhóm/trạng thái và tìm kiếm. File này được tạo sau mỗi lần chạy core, kể cả khi một nhóm test thất bại; chỉ liệt kê các ca thật sự có kết quả. Kết quả tóm tắt: `test-results/core-results.md`. Log Playwright: `test-results/playwright-html/index.html` và `test-results/playwright.json`. Kế hoạch 196 ca vẫn nằm trong `AQUACARE_SYSTEM_TEST_CASES.md` cùng addendum; các ca chưa tự động hóa không được tính PASS.

Runner kiểm tra Supabase local tại `127.0.0.1:54321`, 19 bảng dự kiến, nạp fixture tổng hợp, đặt email/FCM thành giá trị vô hiệu và dùng backend cổng 5051. Nếu kiểm tra môi trường thất bại, runner dừng trước khi chạy bài có ghi dữ liệu.
