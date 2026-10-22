# Bắt buộc cập nhật app Android

Mỗi bản APK mới phải tăng `version` và số build trong `pubspec.yaml`, ví dụ `1.0.3+4`. Khi khởi động, bản release đọc `https://aqua-care2.vercel.app/app-version.json` và so sánh `minimumBuildNumber` với số build đã cài. Nếu số build đã cài thấp hơn, app chỉ hiện màn hình cập nhật. Nút cập nhật mở landing page trong trình duyệt điện thoại.

Quy trình phát hành:

1. Tạo bản APK mới với số build cao hơn; tải lên `AquaCare_Web/public/AquaCare.apk` và kiểm tra nút tải trên landing page.
2. Sau khi APK mới có thể tải được, đặt `minimumBuildNumber` trong `AquaCare_Web/public/app-version.json` bằng số build thấp nhất còn được phép dùng; đặt `latestVersion` bằng số phiên bản hiển thị cho người dùng.
3. Deploy web. Đừng tăng `minimumBuildNumber` trước khi APK mới tải được, vì người dùng sẽ bị chặn mà không có bản cài thay thế.

Trong `flutter run` thông thường, bước kiểm tra phiên bản được bỏ qua để không phụ thuộc bản manifest đã deploy. Có thể thử luồng này với `flutter run --dart-define=AQUACARE_VERSION_URL=http://10.0.2.2:5173/app-version.json` khi Vite đang chạy trên máy. Thay `minimumBuildNumber` ở manifest local thành số lớn hơn build đang cài để thử màn hình cập nhật.

Các bản APK đã phát hành trước khi có chức năng này không tự nhận được màn hình bắt buộc cập nhật. Người dùng cần cài ít nhất một bản có chức năng này trước.
