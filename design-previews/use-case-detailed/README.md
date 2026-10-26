# AquaCare — Use case chi tiết

Đối chiếu mã nguồn ngày **24/10/2026**. Mở `index.html` để xem đầy đủ 7 trang; mỗi trang có PNG, SVG và PlantUML để sửa / đưa vào báo cáo.

## Phạm vi

Đây là các góc nhìn của **cùng một hệ thống AquaCare** (web, Flutter, backend và bộ chạy lịch). Sơ đồ mô tả chức năng đã hiện diện trong code, không phải cam kết mọi cấu hình dịch vụ hoặc quyền database production đã được kiểm thử. Không sửa mã nguồn ứng dụng trong tác vụ lập sơ đồ.

1. **Vai trò:** người dùng chung; khách hàng, quản trị viên, nhân viên; kho, giao hàng, hỗ trợ, bảo trì.
2. **Tài khoản:** đăng ký thường / Google; đăng nhập email hoặc Google; khôi phục mật khẩu; đăng xuất.
3. **Mua hàng và hỗ trợ:** xem sản phẩm / gói, giỏ hàng, đặt hàng, lịch sử đơn, gửi yêu cầu, tra cứu phản hồi, tải APK.
4. **Khách hàng:** quản lý bể và thiết bị gắn bể, dữ liệu / lịch sử / cảnh báo, cấu hình thông báo, relay, lịch hẹn.
5. **Tự động hóa:** nhận dữ liệu, lưu / đánh giá, ghi cảnh báo, gửi qua các kênh tùy cấu hình, thực thi lịch.
6. **Nhân viên:** nghiệp vụ riêng của từng vai trò và lịch sử công việc.
7. **Quản trị:** thống kê doanh thu, loài / ngưỡng, kho thiết bị, nhân viên, đơn hàng, gói cước.

## Quy ước UML

- Association: nét liền, actor tham gia use case; không chỉ thứ tự xử lý.
- `include`: mũi tên nét đứt từ use case chính đến hành vi bắt buộc trong luồng thành công.
- `extend`: mũi tên nét đứt từ hành vi tùy điều kiện về use case được mở rộng. Điều kiện ghi trong ngoặc vuông.
- Generalization: nét liền, tam giác rỗng hướng về vai trò / use case tổng quát.
- Đăng nhập là tiền điều kiện của nghiệp vụ được bảo vệ, không thêm `include Đăng nhập` vào mọi use case.
- Đăng nhập Google và email là hai cách chuyên biệt, không phải phần mở rộng có thể chạy thêm sau nhau.
- Một số ellipse gộp thêm/sửa/xóa để dễ đọc: không có nghĩa cả ba luôn chạy cùng nhau. Không dùng `include` nối các thao tác CRUD với nhau.
- Nhân viên chung chỉ mang chức năng chung. Vai trò legacy `staff` có quyền tổng hợp; không đồng nhất quyền đó với quyền của mọi `staff_*`.
- Các trang có thể nhắc lại actor / use case ở một góc nhìn khác; không tạo thêm quyền hoặc một hệ thống mới.

## Nguồn đối chiếu

| Nhóm | Nguồn và điểm kiểm tra |
|---|---|
| Phân quyền trang | `AquaCare_Web/src/App.tsx`: `destinationForRole`, `RoleRoute` |
| Đăng ký / đăng nhập | `LoginPage.tsx`, `SignupPage.tsx`; `AquaCare_Backend/routes/auth.routes.js` |
| Khôi phục mật khẩu | `ForgotPasswordPage.tsx`: `handleSendReset`, `handleUpdatePassword` |
| Đặt hàng không đăng nhập | `CartPage.tsx`: `handleCheckout`, `user_id: session?.user?.id || null` |
| Phản hồi hỗ trợ | `components/ContactSection.tsx`: `handleSubmit`, `fetchHistory` |
| Bể và cảnh báo | `DashboardPage.tsx`: `handleAddConfirm`, `handleEditConfirm`, `handleDeleteConfirm`, các tab tổng quan / cảm biến / cảnh báo |
| Relay / lịch hẹn | `DashboardPage.tsx`: `toggleRelay`, `saveSchedule`, `clearSchedule`; `AquaCare_App/lib/screens/control_screen.dart` |
| Dữ liệu và thông báo | `AquaCare_Backend/server.js`: callback MQTT, `checkAndInsertAlerts`; các nhánh email / web / app và cooldown |
| Thực thi lịch | `AquaCare_Backend/timer_worker.js`: `dueAction`, `createScheduleChecker`, `needsCommand` |
| Quyền nhân viên | `StaffPage.tsx`: `ROLE_TAB_MAP`, `roleTaskTypes`; `staff_screen.dart`: `_roleTabMap`, ánh xạ loại công việc |
| Kho và giao hàng | `StaffPage.tsx`: `handleSubmit` của trạm đóng gói, `advanceTask` |
| Hỗ trợ sang bảo trì | `StaffPage.tsx`: `handleCreateMaintenanceTask`, `handleResolveSupport` |
| Danh mục quản trị | `AdminPage.tsx`: `saveSpecies`, `saveDevice`, `saveStaff`, `saveSubscription` |
| Duyệt đơn | `AdminPage.tsx`: xác nhận duyệt cập nhật đơn và tạo task packing; mobile `SupabaseService.approveOrder` |
| Gói cước mobile | `admin_screen.dart`: `_openSubscriptionModal`, `_confirmDeleteSubscription`; `supabase_service.dart`: add/update/deleteSubscriptionPlan |
| Doanh thu | `AdminDashboardPreview.tsx`, `AquaCare_Backend/routes/admin-dashboard.routes.js` và module tổng hợp dashboard |

Tên file web không ghi đường dẫn đầy đủ trong bảng nằm tại `AquaCare_Web/src/pages/`, trừ dòng ghi `components/`.

## Những điểm đã kiểm tra để tránh mô hình hóa sai

- **Khách chưa đăng nhập vẫn đặt hàng và gửi hỗ trợ được theo luồng web.** Không bắt buộc đăng nhập cho hai use case này. Lịch sử đơn theo tài khoản cần phiên đăng nhập.
- **QR chuyển khoản đang dùng `example_qr_code`.** Chỉ thể hiện chọn phương thức thanh toán, không thêm actor ngân hàng hay use case thanh toán tự động thành công.
- **Gói cước:** web có xem/thêm; mobile có thêm/sửa/xóa. Chưa suy diễn mua/gia hạn tự động từ việc landing page hiển thị gói.
- **Hiệu chuẩn pH:** code tồn tại nhưng tab web đang bị comment, không đưa vào các chức năng công khai của sơ đồ.
- **Xóa nhân viên:** code xóa hồ sơ `users`; không khẳng định xóa luôn danh tính Auth.
- **Đơn hàng:** có trạng thái `cancelled` không đồng nghĩa có use case hủy/hoàn tiền đã triển khai.
- **Doanh thu:** dùng đơn đã giao, theo ngày tạo đơn; không thể hiện là tiền đã được ngân hàng đối soát.
- **Lịch hẹn:** tạo/sửa lịch không lập tức phát MQTT; worker xử lý khi đến hạn. Nếu trạng thái đã đúng, không phát lại lệnh.
- **Cảnh báo:** lưu lịch sử độc lập với gửi email/push. Gửi thông báo phụ thuộc cài đặt, bộ lọc, cooldown và địa chỉ/token.
- **Cập nhật Android:** `app_version_service.dart` so build với `minimumBuildNumber`; tính năng mở landing page để tải khi bị yêu cầu cập nhật là luồng kỹ thuật bổ trợ, không phải tự cài APK. Bản debug mặc định bỏ qua kiểm tra. Không tách thành mục tiêu nghiệp vụ trong sơ đồ.
- Các chi tiết trình bày như theme, ngôn ngữ, tìm kiếm, phân trang, icon và 404 không tách riêng thành use case nghiệp vụ.

## Tái tạo ảnh

Chạy `node build.cjs`, sau đó `node build-automation.cjs`. Script thứ hai dựng riêng trang tự động hóa để mỗi use case chỉ xuất hiện một lần. Script dùng `sharp` từ runtime Codex trên máy hiện tại; nếu chạy máy khác, đổi đường dẫn require sang gói sharp đã cài.
