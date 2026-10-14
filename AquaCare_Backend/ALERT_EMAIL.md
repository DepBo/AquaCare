# Email cảnh báo trên Render

Render Free chặn kết nối SMTP tới cổng 25, 465 và 587. Máy local vẫn có thể dùng `EMAIL_USER` và `EMAIL_PASS` qua Gmail; backend trên Render cần kênh HTTPS.

1. Tạo API key cho Transactional Email trên Brevo và tạo sender đã xác minh. Có thể xác minh địa chỉ Gmail hiện tại; Brevo có thể thay địa chỉ hiển thị của sender miễn phí để đáp ứng yêu cầu của các nhà cung cấp email.
2. Trong **Render → service backend → Environment**, đặt `BREVO_API_KEY` và `ALERT_EMAIL_FROM` (địa chỉ sender đã xác minh trên Brevo). Nếu không đặt `ALERT_EMAIL_FROM`, backend dùng `EMAIL_USER`.
3. Chọn **Save and deploy**. Không đặt API key ở Vercel hoặc trong mã nguồn.
4. Tạo một cảnh báo mới sau khi hết cooldown. Kiểm tra Render Logs có dòng `[Brevo] Đã nhận email cảnh báo` và kiểm tra trạng thái Delivered trong Brevo. Nếu lỗi, log sẽ ghi mã HTTP và thông báo từ Brevo.

Khi có `BREVO_API_KEY`, backend dùng API Brevo qua HTTPS. Khi không có key, backend tiếp tục dùng Gmail SMTP để giữ nguyên cách chạy local.
