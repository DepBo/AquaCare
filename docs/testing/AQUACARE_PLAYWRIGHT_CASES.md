# AquaCare — phạm vi kiểm thử Playwright

Đây là **40 ca có bài Playwright tự động**, được chọn từ bộ kế hoạch 196 ca. Nhiều bài Playwright có thể cùng kiểm tra một ca. File này mô tả phạm vi, không khẳng định các ca đã PASS.

Bộ kế hoạch đầy đủ được giữ ở `AQUACARE_SYSTEM_TEST_CASES.md` và `AQUACARE_TEST_CASES_ADDENDUM_2026-10-28.md`; bản sao ở `archive/`.

| Mã ca | Bước kiểm thử | Kết quả cần đạt |
|---|---|---|
| NAV-02 | Nhập /duong-dan-khong-ton-tai và đường dẫn sâu không tồn tại → reload | Hiện trang404 AquaCare; không màn trắng hay vòng chuyển hướng |
| NAV-03 | Vào404 từ trang khác → Quay lại; mở404 trong tab mới → Về trang chủ | Back hoạt động theo lịch sử; về trang chủ luôn tới landing; không kẹt trang lỗi |
| GUIDE-01 | Mở landing lần đầu trên desktop/mobile, đóng gợi ý, tải lại | Gợi ý xuất hiện đúng một lần theo localStorage; không che thao tác chính |
| GUIDE-02 | Video hướng dẫn: phát/tạm dừng, tốc độ, toàn màn hình, lỗi tải video | Điều khiển hoạt động; trên điện thoại không tràn ngang; có thông báo lỗi |
| FEED-01 | Kéo nút feedback, thu/phóng cửa sổ, tải lại trên desktop/mobile | Vị trí được nhớ và luôn nằm trong viewport; không cản nút quan trọng |
| NAV-01 | Mở landing desktop/mobile → đi qua menu, sản phẩm, gói, liên hệ, footer | Link/anchor tới đúng nội dung; không ảnh lỗi, nút bị che, tràn ngang; logo giữ tỷ lệ |
| DEMO-01 | Xem V3 Demo 0đ, số lượng kho, modal chi tiết, thêm giỏ | Giá 0đ, không hiển thị như thiết bị vật lý giao thật |
| DEMO-02 | Tài khoản A đặt 1 V3 Demo hai lần với cùng request key | Chỉ tạo một đơn/fulfilment và cấp đúng một MAC |
| DEMO-03 | Hoàn tất checkout V3 Demo | Trạng thái duyệt, đóng gói, giao thành công và log theo thứ tự; không tạo giao hàng vật lý |
| DEMO-04 | A và B đặt đồng thời khi chỉ còn 1 MAC V3 Demo | Chỉ một tài khoản nhận MAC; không cấp trùng hoặc lấy MAC phiên bản khác |
| DEMO-06 | Giỏ chứa V3 Demo và sản phẩm có giá; hết MAC | Không miễn phí sản phẩm có giá; hết MAC từ chối rõ; không có đơn dở |
| DEMO-07 | Dùng MAC của A để tạo bể ở B, dùng MAC demo để thử relay | B bị từ chối; relay chỉ đi tới broker giả, không tới thiết bị thật |
| SHOP-01 | Thêm V1/V3, thêm lặp V1, đổi số lượng, xóa; reload | Dòng hàng/số lượng và tổng giá đúng, không tạo dòng trùng ngoài ý định; persistence khớp thiết kế |
| SHOP-09 | Chọn chuyển khoản → xem QR và xác nhận | Thông tin đúng khả năng hiện tại; QR placeholder không được hiểu là tích hợp thanh toán thật; không tự báo đã thanh toán nếu không có xác minh |
| SHOP-02 | Số lượng0/âm/rất lớn/không nguyên; checkout giỏ rỗng | [YC] Không tạo đơn vô nghĩa; giới hạn hợp lệ rõ, tổng không âm/NaN |
| SHOP-05 | Thiếu tên/phone/email/address, phone/email sai; note60 và61 từ | [YC] Form từ chối dữ liệu bắt buộc/sai; giới hạn note60 từ hoạt động theo UI |
| SHOP-03 | Khách chưa login đặt COD đủ thông tin | orders pending user_id null và order_items khớp; success rồi mới xóa giỏ |
| SHOP-06 | Bấm đặt hai lần hoặc retry khi response chậm | [YC] Một ý định đặt hàng không tạo nhiều đơn; giỏ không bị xóa trước khi biết kết quả |
| SHOP-07 | Insert orders thành công, insert order_items thất bại | [YC] Không có đơn thiếu hàng được xử lý như bình thường; UI không báo thành công; có rollback/khôi phục rõ |
| SHOP-08 | Sửa giá, total_price, product_id, user_id/status trong request test | [YC] Giá/tổng/quyền sở hữu/trạng thái được kiểm tra phía tin cậy; không cho tự tạo đơn delivered giá tùy ý |
| SHOP-04 | A đặt hàng, sửa địa chỉ giao khác địa chỉ cũ | Đơn gắn A, địa chỉ đơn đúng; cập nhật hồ sơ theo luồng hiện có không làm đổi đơn cũ |
| SHOP-11 | Mở catalog gói cước có/rỗng/lỗi dữ liệu | Giá/thời hạn/quyền lợi đúng DB; không giả định có luồng mua/gia hạn tự động khi source chưa triển khai |
| SHOP-10 | A mở lịch sử/chi tiết đơn; thử ID đơn B và khách vãng lai | Chỉ dữ liệu được phép; không lộ địa chỉ/phone/MAC của B |
| SUP-01 | Guest và A gửi hỗ trợ đủ tên/email/nội dung; phone/address tùy chọn | Tạo pending, nội dung chính xác; user_id gắn đúng khi login |
| SUP-02 | Bỏ trường bắt buộc; email sai; gửi lặp; DB lỗi | Validation/lỗi rõ; không thông báo gửi thành công khi thất bại |
| SUP-04 | Insert hỗ trợ lỗi UUID → nhánh retry bỏ user_id | Không tạo hai phiếu; vẫn có khả năng tra đúng phiếu theo thiết kế; không nới quyền dữ liệu |
| SUP-03 | Tra lịch sử theo email A bằng guest, B; gọi RPC trực tiếp | [YC] Không lộ nội dung riêng chỉ nhờ biết email; kiểm tra quyền RPC, không chỉ bộ lọc UI |
| SEC-10 | Request từ origin local/staging hợp lệ và origin ngoài allowlist; OPTIONS | CORS theo chính sách; preflight không cấp quyền API; client không Origin vẫn cần auth cho thao tác riêng tư |
| SEC-02 | POST relay/command không token, token A với tank B1 | [YC] Từ chối trước publish/update; không có tác động IoT ngoài quyền |
| SEC-03 | Relay payload state chuỗi/null, pin ngoài1–3, relay_field ngoài danh sách hoặc không khớp pin | [YC]400; không update cột tùy ý hoặc publish sai kênh |
| SEC-05 | A insert/update device_schedules cho B; đổi device_id của lịch A sang B | RLS USING/WITH CHECK chặn; lịch B không bị xem/sửa/chiếm |
| SEC-04 | Với A: đọc/sửa/xóa tanks, devices, telemetry, alerts, relay_logs của B qua Data API | [YC] RLS chặn từng thao tác, không chỉ UI; dữ liệu B giữ nguyên |
| SEC-06 | Khách/staff tự update users.role; sửa user_id của bể/đơn; sửa giá và trạng thái đơn | [YC] Từ chối nâng quyền/chiếm dữ liệu/gian lận; role không lấy từ dữ liệu người dùng sửa được |
| SEC-07 | Guest/A gọi RPC lịch sử support; truy vấn view nếu được expose | [YC] Không vượt RLS qua function/view; scope dữ liệu theo chính sách xác thực, không chỉ email tự nhập |
| SEC-01 | GET admin dashboard/annual không token, token sai/hết hạn, token A, token admin | Lần lượt401,401,403,200; dữ liệu admin có private,no-store |
| REV-09 | annual không truyền year; year=1999, năm tương lai, abc,2026.5, tham số lặp | Mặc định năm hiện tại; giá trị không hợp lệ400; không crash/500 do input |
| REV-11 | Seed501 và1001 đơn delivered, có created_at trùng | Phân trang500 lấy đủ, ổn định theo created_at/id; tổng không bỏ/trùng đơn |
| REV-07 | Đơn ở hai mốc CLOCK và ranh giới mỗi tháng | Ghi đúng năm/tháng Việt Nam; cận cuối không bị tính hai lần |
| REV-13 | Tổng đơn100đ; ba item cùng subtotal thuộc V1/V2/V3 | Phân bổ33/33/34 theo thứ tự items; tổng100, không hụt tiền do làm tròn |
| AUTH-14 | Khách/khách A truy cập trực tiếp /admin và /staff; sửa role cache local thành admin | Quyền được xác minh từ nguồn tin cậy; không lấy được dữ liệu admin chỉ nhờ sửa local |
