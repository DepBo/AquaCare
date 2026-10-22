# Chạy backend AquaCare ở máy cá nhân

Mở hai terminal:

```powershell
cd C:\Users\Acer\Downloads\AquaCare\AquaCare_Backend
node .\server.js
```

```powershell
cd C:\Users\Acer\Downloads\AquaCare\AquaCare_Web
npm run dev
```

Trang Vite local (thường là `http://localhost:5173`) chuyển các request `/api` tới backend ở `http://127.0.0.1:5000`. Sau khi sửa backend, khởi động lại `node .\server.js`; không cần push/deploy Render để kiểm tra trên web local. Vercel đang chạy trên Internet vẫn gọi Render, nên sẽ không thấy backend local.

Flutter debug trên Android emulator mặc định gọi `http://10.0.2.2:5000`. Khi chạy trên điện thoại Android thật cùng mạng Wi-Fi, dùng IP LAN của máy tính:

```powershell
flutter run --dart-define=AQUACARE_API_URL=http://192.168.1.10:5000
```

Thay `192.168.1.10` bằng IPv4 thật của máy tính; đảm bảo Windows Firewall cho phép cổng 5000. Bản release luôn gọi Render, không phụ thuộc địa chỉ debug. Không cần thay URL trong code khi deploy backend.
