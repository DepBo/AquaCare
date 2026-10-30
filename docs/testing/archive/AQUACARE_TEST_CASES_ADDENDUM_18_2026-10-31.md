# Ca kiểm thử bổ sung sau bộ 178 ca

Ngày rà soát: 28/10/2026. Các ca dưới đây bổ sung cho `AQUACARE_SYSTEM_TEST_CASES.md`; **không tính là PASS chỉ vì có trong danh sách**. W = web, M = mobile, B = backend, D = database. Ca ghi dữ liệu chỉ chạy với Supabase local, tài khoản giả và broker/email giả.

| ID | Mức / nền tảng | Bước và dữ liệu kiểm thử | Kết quả cần đạt | Tự động hóa hiện có |
|---|---|---|---|---|
| MSET-01 | P1 M | Mở Cài đặt với tài khoản test, kiểm tra hồ sơ, liên hệ, số phiên bản/build | Thông tin đúng tài khoản và APK; giao diện vừa màn hình nhỏ | Chưa |
| MSET-02 | P1 M | Đổi mật khẩu: để trống, ngắn dưới 6 ký tự, trùng mật khẩu cũ, xác nhận lệch | Báo lỗi tại form; không gọi Auth khi dữ liệu chưa hợp lệ | Một phần: widget test |
| MSET-03 | P0 M/D | Nhập mật khẩu cũ sai, rồi mật khẩu cũ đúng | Sai thì không đổi; đúng thì mật khẩu mới đăng nhập được, cũ không còn dùng được | Chưa; cần Auth local |
| MSET-04 | P0 M/D | Đổi mật khẩu rồi đóng/mở app, đăng xuất, đăng nhập lại | Phiên và trạng thái đăng nhập nhất quán; không để lộ tài khoản trước | Chưa; cần emulator/Auth local |
| MSET-05 | P1 M | Mở hỗ trợ/feedback từ Cài đặt và Tổng quan, không có ứng dụng xử lý liên kết | Link đúng; lỗi mở link được báo, app không treo | Chưa; cần emulator |
| DEMO-01 | P1 W/D | Xem V3 Demo 0đ, số lượng kho, modal chi tiết, thêm giỏ | Giá 0đ, không hiển thị như thiết bị vật lý giao thật | Chưa |
| DEMO-02 | P0 W/B/D | Tài khoản A đặt 1 V3 Demo hai lần với cùng request key | Chỉ tạo một đơn/fulfilment và cấp đúng một MAC | Một phần: backend unit; cần local E2E |
| DEMO-03 | P0 B/D | Hoàn tất checkout V3 Demo | Trạng thái duyệt, đóng gói, giao thành công và log theo thứ tự; không tạo giao hàng vật lý | Chưa; cần local E2E |
| DEMO-04 | P0 B/D | A và B đặt đồng thời khi chỉ còn 1 MAC V3 Demo | Chỉ một tài khoản nhận MAC; không cấp trùng hoặc lấy MAC phiên bản khác | Chưa; cần local E2E |
| DEMO-05 | P0 B/D | Worker gửi mail bị lỗi rồi thử lại | Mailpit chỉ nhận email test; không gửi mail thật; không gửi trùng khi retry | Một phần: backend unit; cần Mailpit E2E |
| DEMO-06 | P0 W/B/D | Giỏ chứa V3 Demo và sản phẩm có giá; hết MAC | Không miễn phí sản phẩm có giá; hết MAC từ chối rõ; không có đơn dở | Chưa; cần local E2E |
| DEMO-07 | P0 W/M/D | Dùng MAC của A để tạo bể ở B, dùng MAC demo để thử relay | B bị từ chối; relay chỉ đi tới broker giả, không tới thiết bị thật | Chưa; cần local E2E |
| GUIDE-01 | P2 W | Mở landing lần đầu trên desktop/mobile, đóng gợi ý, tải lại | Gợi ý xuất hiện đúng một lần theo localStorage; không che thao tác chính | Một phần: web smoke |
| GUIDE-02 | P1 W | Video hướng dẫn: phát/tạm dừng, tốc độ, toàn màn hình, lỗi tải video | Điều khiển hoạt động; trên điện thoại không tràn ngang; có thông báo lỗi | Một phần: web smoke |
| FEED-01 | P2 W | Kéo nút feedback, thu/phóng cửa sổ, tải lại trên desktop/mobile | Vị trí được nhớ và luôn nằm trong viewport; không cản nút quan trọng | Chưa |
| FEED-02 | P1 W/M | Bấm feedback khi có/không có trình duyệt xử lý | Mở đúng form bên ngoài hoặc báo lỗi; không tự gửi dữ liệu khách hàng | Chưa |
| SAFE-01 | P0 B/W | Đổi URL test sang Supabase production/Render, để sót khóa email/FCM thật | Runner/backend/web từ chối khởi động trước mọi thao tác | Một phần: backend safety unit và Vite guard |
| SAFE-02 | P0 B/W/M | Chạy `RUN_SAFE_TESTS.cmd` khi production vẫn hoạt động | Chỉ endpoint local được gọi; không phát MQTT, email, FCM hoặc relay thật | Một phần: runner + web network block; cần quan sát mạng |

## Phạm vi nút Run hiện tại

`RUN_SAFE_TESTS.cmd` chạy backend unit tests, Flutter widget tests và Playwright web smoke tests. Nó ghi kết quả từng **suite** trong `test-results/latest.md` và chi tiết Playwright ở `test-results/playwright-html/index.html`. Đây là bước đầu của tự động hóa. Những ca cần đăng nhập thật bằng Auth local, database fixture, simulator/broker giả hoặc emulator vẫn để **chưa chạy** cho đến khi có fixture và chốt chặn tương ứng.
