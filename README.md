# AquaCare

AquaCare là hệ thống theo dõi và quản lý nuôi trồng thủy sản, gồm ứng dụng web, ứng dụng di động và backend kết nối dữ liệu cảm biến với thiết bị trong ao/bể.

Trong quá trình nuôi, chất lượng nước và trạng thái thiết bị có thể thay đổi nhanh, trong khi việc kiểm tra thủ công thường tốn thời gian và khó theo dõi liên tục. AquaCare tập trung đưa dữ liệu từ thiết bị IoT về một nơi để người nuôi theo dõi, nhận cảnh báo và chủ động điều khiển một số thiết bị từ xa. Hệ thống đồng thời cung cấp các màn hình quản lý cho khách hàng, nhân viên và quản trị viên.

## Giới thiệu chức năng

### Theo dõi môi trường nuôi

Thiết bị gửi dữ liệu cảm biến về hệ thống thông qua MQTT. Backend tiếp nhận dữ liệu, xử lý và lưu vào Supabase để các ứng dụng truy vấn. Các chỉ số được sử dụng trong luồng theo dõi bao gồm nhiệt độ nước, độ pH, TDS và trạng thái mực nước. Dashboard giúp người dùng quan sát tình trạng hiện tại; phần lịch sử hỗ trợ xem lại biến động theo thời gian.

Ngưỡng đánh giá có thể được cấu hình theo loài nuôi. Dữ liệu được phân loại thành trạng thái bình thường, cần chú ý hoặc nguy hiểm để người vận hành nhận biết nhanh khi môi trường vượt khỏi khoảng phù hợp.

### Cảnh báo và thông báo

Khi chỉ số vượt ngưỡng hoặc phát hiện điều kiện bất thường, backend tạo cảnh báo gắn với bể và thiết bị liên quan. Hệ thống hỗ trợ gửi email và thông báo đẩy Firebase Cloud Messaging khi thông tin dịch vụ đã được cấu hình. Cơ chế xử lý cảnh báo có lọc và gộp trạng thái nhằm hạn chế gửi lặp liên tục cho cùng một tình trạng.

### Điều khiển thiết bị

Người dùng có thể gửi lệnh điều khiển relay từ giao diện. Backend xác định thiết bị theo bể nuôi, phát lệnh qua MQTT và cập nhật trạng thái vào cơ sở dữ liệu. Endpoint lệnh thô cho phép chuyển một chuỗi lệnh tới thiết bị theo giao thức phần cứng đã triển khai. Tác vụ hẹn giờ chạy trong backend hỗ trợ các luồng điều khiển có lịch.

### Tài khoản và phân quyền

Hệ thống có luồng đăng ký, đăng nhập và khôi phục mật khẩu. Khu vực sau đăng nhập được phân theo vai trò: khách hàng sử dụng dashboard nuôi trồng; nhân viên truy cập màn hình nghiệp vụ; quản trị viên quản lý cấu hình và dữ liệu hệ thống. Các trang bảo vệ kiểm tra phiên Supabase và vai trò người dùng trước khi hiển thị.

### Quản lý vận hành và dịch vụ

Giao diện quản trị có các khu vực quản lý loài cá, thiết bị, nhân viên, đơn hàng và gói dịch vụ. Dữ liệu thiết bị có thể được theo dõi theo phiên bản và trạng thái sử dụng/kho. Quản trị viên cũng có thể cấu hình các khoảng ngưỡng nhiệt độ, pH và TDS theo loài, giúp hệ thống đánh giá dữ liệu sát với đối tượng nuôi.

Ứng dụng web còn có các trang giới thiệu sản phẩm và gói đăng ký, giỏ hàng, dashboard khách hàng và các trang nhân viên. Ứng dụng Flutter cung cấp trải nghiệm di động với các màn hình tổng quan, cảnh báo, điều khiển và quản trị.

### Kiến trúc tổng quan

```text
Cảm biến / thiết bị IoT
        │ MQTT telemetry và lệnh điều khiển
        ▼
Backend Node.js + Express ───── Firebase: thông báo đẩy
        │                       Email: cảnh báo
        ▼
     Supabase
        ▲
        ├── AquaCare Web (React + TypeScript)
        └── AquaCare App (Flutter)
```

Backend nhận telemetry và xử lý cảnh báo, đồng thời cung cấp API cho đăng nhập, dashboard quản trị và điều khiển thiết bị. Web và ứng dụng di động đọc dữ liệu nghiệp vụ qua Supabase, sử dụng API backend cho các thao tác tương ứng. Supabase đảm nhiệm lưu trữ và xác thực dữ liệu; MQTT là kênh liên lạc với thiết bị.

## Chức năng chính

- Theo dõi dữ liệu chất lượng nước như pH, nhiệt độ, TDS và mực nước.
- Hiển thị lịch sử dữ liệu, trạng thái thiết bị và cảnh báo theo ngưỡng của từng loài.
- Điều khiển relay và gửi lệnh tới phần cứng qua MQTT.
- Quản lý tài khoản, bể nuôi, thiết bị, nhân viên, sản phẩm và gói dịch vụ.
- Gửi cảnh báo email và thông báo đẩy khi được cấu hình.
- Cung cấp giao diện quản trị trên web và ứng dụng di động.

## AquaCare giải quyết vấn đề gì?

Quản lý ao nuôi đòi hỏi người vận hành theo dõi chất lượng nước thường xuyên, nhận biết sớm các dấu hiệu bất thường và phản ứng kịp thời. Khi số lượng bể tăng lên, việc ghi chép thủ công khiến dữ liệu khó tổng hợp, khó đối chiếu và có thể bỏ lỡ những thay đổi quan trọng giữa các lần kiểm tra.

AquaCare kết hợp thiết bị cảm biến, phần mềm và lưu trữ dữ liệu để hỗ trợ các công việc đó trên cùng một hệ thống. Người dùng có thể xem thông tin từ nhiều bể, tra cứu lại lịch sử, nhận cảnh báo khi chỉ số lệch khỏi ngưỡng, và gửi lệnh đến các thiết bị được kết nối. Ngoài theo dõi kỹ thuật, hệ thống còn có các chức năng quản lý người dùng, nhân viên, thiết bị, đơn hàng và gói dịch vụ.

> AquaCare là công cụ hỗ trợ quan sát và vận hành. Chất lượng kết quả phụ thuộc vào việc hiệu chuẩn cảm biến, kết nối mạng, cấu hình ngưỡng và cấu hình dịch vụ ngoài hệ thống.

## Các nhóm người dùng

### Khách hàng và người nuôi

Khách hàng sử dụng dashboard để xem bể nuôi thuộc tài khoản của mình, theo dõi các chỉ số môi trường và lịch sử, xem cảnh báo, cũng như sử dụng các thao tác điều khiển được cấp quyền. Giao diện web và ứng dụng di động hướng đến việc giúp người nuôi nắm nhanh tình trạng tổng thể rồi mở thông tin chi tiết khi cần.

Khu vực khách hàng trên web còn có các nội dung giới thiệu sản phẩm, gói dịch vụ, giỏ hàng và thông tin liên hệ. Việc truy cập các màn hình được bảo vệ dựa trên phiên xác thực và vai trò tài khoản.

### Nhân viên

Khu vực nhân viên phục vụ các tác vụ vận hành được phân công. Backend dashboard tổng hợp những thông tin như đơn hàng chờ xử lý, công việc đóng gói, đơn đang giao, thiết bị đã được gán và số lượng nhân viên. Màn hình quản trị còn tổ chức vai trò nhân viên theo nhóm công việc như kho, giao hàng, hỗ trợ và bảo trì.

### Quản trị viên

Quản trị viên quản lý cấu hình và dữ liệu vận hành của hệ thống. Các phân hệ hiện diện trong giao diện gồm tổng quan, loài nuôi, thiết bị, nhân viên, đơn hàng và gói cước. Tùy dữ liệu và quyền đã thiết lập, quản trị viên có thể quản lý thông tin loài, ngưỡng môi trường, phân bổ thiết bị, tài khoản nhân viên, trạng thái đơn hàng và đặc tính các gói dịch vụ.

## Mô tả chức năng chi tiết

### 1. Dashboard và quản lý bể nuôi

Dashboard tập trung thông tin theo bể nuôi để người vận hành không phải truy cập nhiều nguồn dữ liệu riêng lẻ. Tùy cấu hình dữ liệu, dashboard hiển thị thông số mới nhất, trạng thái chất lượng nước, cảnh báo và hoạt động điều khiển. Người dùng có thể chọn bể cần xem và đi sâu vào biểu đồ hoặc lịch sử cảm biến.

Các thành phần giao diện hỗ trợ tổng quan bể và phân tích lịch sử. Ứng dụng Flutter có màn hình tổng quan, màn hình chi tiết cảm biến và các tiện ích biểu đồ cảnh báo. Giao diện web có dashboard khách hàng và bảng điều khiển thiết bị.

### 2. Giám sát cảm biến và lịch sử

Backend nhận telemetry theo topic MQTT của thiết bị, đối chiếu thiết bị với bể trong cơ sở dữ liệu, sau đó lưu các giá trị hợp lệ vào bảng lịch sử. Các luồng dữ liệu hiện có đề cập đến pH, nhiệt độ, TDS và tình trạng mực nước. Người dùng có thể xem lại dữ liệu theo thời gian nhằm nhận biết xu hướng thay đổi, thay vì chỉ nhìn vào một số đo tại thời điểm hiện tại.

Lịch sử cũng giúp việc xem xét cảnh báo có thêm bối cảnh: người vận hành có thể đánh giá chỉ số đã thay đổi ra sao, bất thường mới xuất hiện hay đã kéo dài, và cần kiểm tra thiết bị hoặc nguồn nước hay không. Độ chính xác của kết luận phụ thuộc vào cảm biến và tần suất thiết bị gửi dữ liệu.

### 3. Đánh giá ngưỡng theo loài

Mỗi loài thủy sản có điều kiện môi trường phù hợp khác nhau. AquaCare tổ chức cấu hình ngưỡng theo loài để backend và giao diện có thể so sánh dữ liệu cảm biến với khoảng đánh giá tương ứng. Với các chỉ số có ngưỡng tốt và ngưỡng cảnh báo, dữ liệu được phân loại thành `Good`, `Warn` hoặc `Danger`.

Quản trị viên có thể quản lý loài và các khoảng giá trị môi trường được hệ thống sử dụng. Nên xác minh ngưỡng với yêu cầu thực tế của đối tượng nuôi trước khi đưa vào vận hành; cài đặt ứng dụng không thay thế tư vấn chuyên môn hoặc hiệu chuẩn thiết bị.

### 4. Cảnh báo môi trường

Khi chỉ số nằm ngoài khoảng được cấu hình hoặc trạng thái mực nước không bình thường, backend có thể ghi nhận sự kiện vào lịch sử cảnh báo. Cảnh báo được gắn với bể, thiết bị, loại chỉ số, giá trị thực tế và nội dung mô tả để tiện tra cứu.

Luồng cảnh báo có thể kiểm tra cấu hình nhận thông báo của bể, thông tin tài khoản và thời điểm cảnh báo gần nhất. Bộ lọc cooldown/gộp trạng thái giúp hạn chế việc phát đi nhiều thông báo lặp trong một khoảng ngắn. Người vận hành vẫn có thể mở màn hình cảnh báo để xem sự kiện đã lưu.

### 5. Gửi email và thông báo đẩy

Backend hỗ trợ email cảnh báo. Khi cấu hình `BREVO_API_KEY`, email được gửi qua API HTTPS của Brevo; nếu không có khóa này, backend có thể dùng Gmail SMTP với `EMAIL_USER` và `EMAIL_PASS` khi môi trường cho phép. Chi tiết cấu hình triển khai email được ghi trong `AquaCare_Backend/ALERT_EMAIL.md`.

Thông báo đẩy được tích hợp qua Firebase Cloud Messaging. Ứng dụng web có luồng xin quyền trình duyệt và lấy token; ứng dụng Flutter khởi tạo Firebase Messaging và đồng bộ token sau khi đăng nhập. Backend cần thông tin Firebase Admin hợp lệ để gửi thông báo. Người dùng cũng cần cấp quyền thông báo trên trình duyệt hoặc thiết bị.

### 6. Điều khiển relay và lệnh MQTT

Từ bảng điều khiển, người dùng có thể gửi yêu cầu bật/tắt relay. Backend nhận mã bể, chân relay, trạng thái mong muốn và trường trạng thái cần cập nhật. Sau đó backend tra thiết bị theo mã bể, lấy địa chỉ MAC, gửi thông điệp MQTT tới topic lệnh của thiết bị và lưu trạng thái relay vào Supabase.

Endpoint gửi lệnh thô nhận mã bể cùng chuỗi lệnh, sau đó chuyển lệnh đến topic MQTT tương ứng với địa chỉ MAC. Lệnh chính xác cần phù hợp giao thức firmware của thiết bị. Việc gửi lệnh chỉ được xem là thành công hoàn toàn khi thiết bị nhận và thực hiện lệnh; phản hồi HTTP của backend chủ yếu xác nhận quá trình gửi/xử lý ở phía server.

### 7. Lịch điều khiển và mô phỏng phần cứng

Backend có worker xử lý tác vụ hẹn giờ và lịch điều khiển thiết bị. Web có tiện ích xử lý thời gian lịch thiết bị, còn backend có `timer_worker.js` để kiểm tra và phát lệnh theo lịch đã lưu. `hardware_simulator.js` hỗ trợ mô phỏng gửi telemetry trong quá trình phát triển hoặc trình diễn khi chưa có thiết bị thật; cần cấu hình Supabase trước khi chạy.

### 8. Đăng nhập và quản lý phiên

Web có màn hình đăng nhập, đăng ký, quên mật khẩu và đặt lại mật khẩu. Backend cung cấp API đăng ký/đăng nhập, trong khi Supabase được dùng cho xác thực và dữ liệu hồ sơ. Các trang dashboard, nhân viên và quản trị viên kiểm tra vai trò trước khi cho truy cập. Nếu phiên không hợp lệ hoặc vai trò không khớp với khu vực được yêu cầu, ứng dụng chuyển người dùng về trang phù hợp.

Ứng dụng di động có màn hình khởi động, hướng dẫn ban đầu, đăng nhập và đăng ký. Ứng dụng có thể ghi nhớ lựa chọn đăng nhập, khôi phục phiên khi khởi chạy và điều hướng theo vai trò đã xác thực.

### 9. Quản trị thiết bị

Phân hệ thiết bị tập trung thông tin gắn với bể, địa chỉ MAC, phiên bản phần cứng và trạng thái sử dụng. Màn hình quản trị cung cấp bộ lọc theo phiên bản thiết bị (V1–V4) và trạng thái như đang dùng, đã được mua hoặc còn trong kho. Việc gán đúng thiết bị với đúng bể là điều kiện để backend định tuyến lệnh MQTT và gắn telemetry với dữ liệu nuôi.

### 10. Quản lý loài và điều kiện nuôi

Danh mục loài giúp hệ thống lưu thông tin đối tượng nuôi và các ngưỡng môi trường áp dụng. Dữ liệu này được dùng ở cả khâu đánh giá cảm biến lẫn giao diện hiển thị trạng thái. Khi tạo hoặc cập nhật ngưỡng, cần đảm bảo giá trị nhỏ nhất không lớn hơn giá trị lớn nhất và các khoảng tốt/cảnh báo được thiết lập nhất quán.

### 11. Quản lý nhân viên và công việc

Quản trị viên có thể tổ chức nhân viên theo vai trò nghiệp vụ. Dashboard backend hiện tổng hợp một số chỉ số vận hành, bao gồm số nhân viên, đơn hàng chờ xử lý, công việc đóng gói đang thực hiện và đơn đang giao. Những dữ liệu này giúp theo dõi công việc nội bộ song song với tình trạng kỹ thuật của thiết bị.

### 12. Sản phẩm, đơn hàng và gói dịch vụ

Web có trang sản phẩm, gói đăng ký và giỏ hàng. Schema cơ sở dữ liệu có các bảng liên quan đến sản phẩm, đơn hàng, chi tiết đơn, mục giỏ hàng, gói đăng ký và đăng ký gói của người dùng. Phần quản trị đơn hàng hỗ trợ theo dõi các trạng thái như chờ duyệt, đã duyệt, đang giao và đã giao.

### 13. Giao diện web và ứng dụng di động

Web được xây dựng bằng React, TypeScript và Vite. Ứng dụng Flutter chứa các màn hình khách hàng, cảnh báo, điều khiển, nhân viên và quản trị, sử dụng chung Supabase làm nguồn dữ liệu nghiệp vụ. Tùy vai trò và nền tảng, một số tính năng hoặc cấu hình thông báo có thể khác nhau.

### 14. Cấu hình giao diện khách hàng

Ứng dụng di động lưu tùy chọn giao diện khách hàng và hỗ trợ tùy chỉnh chế độ sáng/tối. Giao diện dashboard và các biểu đồ giúp trình bày thông tin môi trường theo dạng trực quan hơn để người vận hành dễ nhận biết điểm cần chú ý.

## Cấu trúc dự án

```text
AquaCare/
├── AquaCare_Backend/   # API Express, MQTT, xử lý cảnh báo và tác vụ hẹn giờ
├── AquaCare_Web/       # Giao diện React + TypeScript, chạy bằng Vite
├── AquaCare_App/       # Ứng dụng Flutter cho Android, iOS, Windows và các nền tảng Flutter hỗ trợ
├── migrations/         # Các tệp migration cơ sở dữ liệu
├── schema.sql          # Schema cơ sở dữ liệu
├── database.txt        # Tài liệu/thông tin cơ sở dữ liệu
└── README.md
```

## Yêu cầu

- Node.js và npm.
- Flutter SDK tương thích với phiên bản Dart trong `AquaCare_App/pubspec.yaml`.
- Tài khoản/dự án Supabase đã được thiết lập schema.
- Tài khoản Firebase nếu cần gửi thông báo đẩy; thông tin broker MQTT nếu cần kết nối phần cứng.

## Chạy backend

```bash
cd AquaCare_Backend
npm install
node server.js
```

Backend mặc định chạy tại `http://localhost:5000`. Kiểm tra trạng thái bằng `GET /api/health`.

Tạo `AquaCare_Backend/.env` với các giá trị phù hợp:

```dotenv
PORT=5000
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>

# Email cảnh báo: dùng SMTP Gmail khi chạy local
EMAIL_USER=<email>
EMAIL_PASS=<app-password>

# Tùy chọn trên môi trường triển khai: gửi email qua Brevo HTTPS
BREVO_API_KEY=<brevo-api-key>
ALERT_EMAIL_FROM=<verified-sender-email>

# Firebase Admin: JSON service account được tuần tự hóa thành một dòng
FIREBASE_SERVICE_ACCOUNT=<service-account-json>
```

Nếu không đặt `FIREBASE_SERVICE_ACCOUNT`, backend tìm tệp `config/firebase-service-account.json`. Không commit tệp khóa hoặc biến môi trường chứa bí mật. Thông tin kết nối HiveMQ hiện được khai báo trong `AquaCare_Backend/server.js`; chuyển các thông tin đó sang biến môi trường trước khi sử dụng cấu hình broker riêng hoặc công khai mã nguồn.

## Chạy ứng dụng web

```bash
cd AquaCare_Web
npm install
npm run dev
```

Vite in địa chỉ truy cập local ra terminal (thông thường là `http://localhost:5173`). Các lệnh có sẵn:

```bash
npm run build
npm run preview
```

Có thể tạo `AquaCare_Web/.env.local` để cấu hình dịch vụ:

```dotenv
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Web có URL mặc định cho backend triển khai. Khi phát triển local, cần đặt `VITE_API_URL` để các API đăng nhập, điều khiển thiết bị và dashboard trỏ tới backend local. Các biến `VITE_*` được đưa vào mã phía trình duyệt; chỉ dùng khóa Supabase anon/public key, tuyệt đối không đưa service role key vào web.

## Chạy ứng dụng Flutter

Tạo `AquaCare_App/.env`:

```dotenv
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<supabase-anon-key>
```

Sau đó chạy:

```bash
cd AquaCare_App
flutter pub get
flutter run
```

Ứng dụng cũng hỗ trợ URL backend dashboard qua Dart define:

```bash
flutter run --dart-define=ADMIN_DASHBOARD_API_URL=http://localhost:5000
```

## API chính

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Kiểm tra backend hoạt động |
| `POST` | `/api/auth/register` | Đăng ký tài khoản |
| `POST` | `/api/auth/login` | Đăng nhập |
| `GET` | `/api/admin/dashboard` | Dữ liệu dashboard quản trị |
| `POST` | `/api/device/relay` | Điều khiển relay qua MQTT |
| `POST` | `/api/device/command` | Gửi lệnh thô tới thiết bị qua MQTT |

Các API quản trị yêu cầu phiên đăng nhập và quyền admin. Payload chi tiết xem trong mã nguồn tại `AquaCare_Backend/routes/` và phần xử lý endpoint thiết bị trong `AquaCare_Backend/server.js`.

## Cơ sở dữ liệu và kiểm tra

- Dùng `schema.sql` để tham khảo schema ban đầu; các cập nhật sau có thể nằm trong `migrations/`.
- Backend có các bài kiểm tra Node.js trong `AquaCare_Backend/test/`.
- Web có kiểm tra trong `AquaCare_Web/tests/`.
- Ứng dụng Flutter dùng cấu hình và lệnh chuẩn của Flutter; xem `AquaCare_App/README.md`.

## Bảo mật

- Không commit `.env`, khóa Supabase service role, Firebase service account hoặc mật khẩu email.
- Chỉ dùng Supabase anon key trong ứng dụng web/di động và cấu hình Row Level Security phù hợp trong Supabase.
- Các credential MQTT đang có trong mã nguồn backend cần được thay/thu hồi nếu repository từng được chia sẻ công khai.
- Giới hạn CORS và cấu hình endpoint theo các domain triển khai thực tế trước khi đưa hệ thống lên production.

## AquaCare giải quyết vấn đề gì?

Quản lý ao nuôi đòi hỏi người vận hành theo dõi chất lượng nước thường xuyên, nhận biết sớm dấu hiệu bất thường và phản ứng kịp thời. Khi số lượng bể tăng, ghi chép thủ công khiến dữ liệu khó tổng hợp và có thể bỏ lỡ thay đổi giữa các lần kiểm tra. AquaCare kết hợp thiết bị cảm biến, phần mềm và lưu trữ dữ liệu để người dùng xem tình trạng nhiều bể, tra cứu lịch sử, nhận cảnh báo và điều khiển thiết bị từ xa. Hệ thống cũng có các chức năng quản lý nhân viên, thiết bị, đơn hàng và gói dịch vụ.

> AquaCare là công cụ hỗ trợ quan sát và vận hành. Kết quả phụ thuộc vào độ chính xác cảm biến, kết nối mạng, ngưỡng cấu hình và dịch vụ ngoài hệ thống.

## Nhóm người dùng

### Khách hàng và người nuôi

Khách hàng dùng dashboard để xem bể nuôi, chỉ số môi trường, lịch sử và cảnh báo. Tùy quyền và trạng thái thiết bị, người dùng có thể gửi lệnh điều khiển. Web còn có trang giới thiệu sản phẩm, gói dịch vụ, giỏ hàng và liên hệ. Ứng dụng di động cung cấp màn hình tổng quan, cảnh báo, điều khiển và lịch sử cảm biến.

### Nhân viên

Khu vực nhân viên phục vụ tác vụ vận hành được phân công. Hệ thống tổ chức vai trò theo nhóm công việc như kho, giao hàng, hỗ trợ và bảo trì. Dashboard tổng hợp số liệu như đơn chờ xử lý, công việc đóng gói, đơn đang giao, thiết bị đã gán và số lượng nhân viên.

### Quản trị viên

Quản trị viên quản lý loài nuôi, ngưỡng môi trường, thiết bị, nhân viên, đơn hàng và gói dịch vụ. Màn hình thiết bị có bộ lọc theo phiên bản V1–V4 và tình trạng sử dụng/kho. API dashboard yêu cầu phiên hợp lệ và vai trò admin.

## Chức năng chi tiết

### Theo dõi chất lượng nước

Backend nhận dữ liệu telemetry từ thiết bị qua MQTT, xác định thiết bị và bể tương ứng, rồi lưu bản ghi vào Supabase. Các chỉ số trong luồng hiện tại gồm pH, nhiệt độ, TDS và tình trạng mực nước. Dashboard tập trung dữ liệu hiện tại; biểu đồ và màn hình lịch sử giúp quan sát xu hướng theo thời gian.

### Ngưỡng theo loài

Điều kiện phù hợp khác nhau giữa các loài. AquaCare cho phép lưu ngưỡng môi trường gắn với loài và dùng chúng để phân loại dữ liệu thành `Good`, `Warn` hoặc `Danger`. Quản trị viên có thể điều chỉnh ngưỡng; nên xác minh giá trị với yêu cầu nuôi thực tế trước khi sử dụng.

### Cảnh báo

Khi chỉ số vượt khoảng cấu hình hoặc mực nước bất thường, backend có thể tạo sự kiện trong `alerts_history`, gắn với bể, thiết bị, loại chỉ số, giá trị và mô tả. Hệ thống kiểm tra cài đặt thông báo của bể và thời điểm cảnh báo trước đó. Cơ chế cooldown/gộp trạng thái hạn chế thông báo trùng lặp.

### Email và thông báo đẩy

Email cảnh báo dùng Brevo API HTTPS khi cấu hình `BREVO_API_KEY`; nếu không, backend có thể dùng Gmail SMTP với `EMAIL_USER` và `EMAIL_PASS` trong môi trường hỗ trợ. Xem `AquaCare_Backend/ALERT_EMAIL.md` để biết chi tiết. Thông báo đẩy dùng Firebase Cloud Messaging. Web xin quyền trình duyệt và lấy FCM token; Flutter khởi tạo Firebase và đồng bộ token sau khi đăng nhập. Backend cần Firebase Admin service account hợp lệ.

### Điều khiển relay và MQTT

Người dùng gửi yêu cầu bật/tắt relay từ bảng điều khiển. Backend tra thiết bị bằng `tank_id`, lấy địa chỉ MAC, gửi thông điệp tới topic MQTT của thiết bị và cập nhật trạng thái relay trong Supabase. API lệnh thô chuyển chuỗi lệnh nguyên dạng; nội dung phải khớp giao thức firmware. Phản hồi từ backend không thay thế xác nhận thiết bị đã thực sự thực thi lệnh.

### Lịch thiết bị và mô phỏng

`timer_worker.js` xử lý tác vụ theo lịch; web có tiện ích quản lý thời gian lịch thiết bị. `hardware_simulator.js` hỗ trợ mô phỏng telemetry trong lúc phát triển hoặc trình diễn, cần cấu hình Supabase trước khi sử dụng.

### Tài khoản và phân quyền

Web có đăng nhập, đăng ký, quên mật khẩu và đặt lại mật khẩu. Ứng dụng kiểm tra phiên Supabase và vai trò để điều hướng tới trang khách hàng, nhân viên hoặc quản trị. Flutter có các màn hình đăng nhập/đăng ký, có thể lưu lựa chọn đăng nhập và khôi phục phiên khi mở ứng dụng.

### Thiết bị, đơn hàng và gói dịch vụ

Phân hệ thiết bị quản lý địa chỉ MAC, phiên bản phần cứng, trạng thái kho và thiết bị được gán cho bể. Danh mục loài lưu thông tin đối tượng nuôi cùng ngưỡng đánh giá. Web có trang sản phẩm, gói đăng ký và giỏ hàng; schema có các nhóm bảng sản phẩm, đơn hàng, chi tiết đơn, giỏ hàng, gói đăng ký và đăng ký gói. Trạng thái đơn có thể gồm chờ duyệt, đã duyệt, đang giao và đã giao.

## Luồng hoạt động

### Từ cảm biến tới dashboard

1. Cảm biến đo môi trường tại bể.
2. Firmware gửi payload telemetry tới broker MQTT.
3. Backend đăng ký nhận các topic telemetry qua kết nối TLS.
4. Backend tìm thiết bị theo thông tin nhận dạng và xác định bể được gán.
5. Dữ liệu được lưu thành lịch sử trong Supabase.
6. Backend tải ngưỡng theo loài và đánh giá chỉ số.
7. Nếu có bất thường, backend ghi cảnh báo và xử lý các kênh thông báo được cấu hình.
8. Web hoặc ứng dụng Flutter đọc dữ liệu và hiển thị dashboard/lịch sử.

### Từ thao tác người dùng tới relay

1. Người dùng chọn bể và thao tác relay.
2. Ứng dụng gọi API backend với mã bể, chân relay, trạng thái và trường cập nhật.
3. Backend tra địa chỉ MAC của thiết bị được gán.
4. Backend gửi lệnh lên topic MQTT tương ứng.
5. Backend cập nhật trạng thái thiết bị trong Supabase.
6. Firmware nhận và thực hiện lệnh; telemetry tiếp theo có thể dùng để đối chiếu.

### Luồng thông báo

Ứng dụng xin quyền nhận thông báo, Firebase cấp token, ứng dụng đồng bộ token lên dữ liệu tài khoản. Khi phát sinh cảnh báo đủ điều kiện, backend kiểm tra cấu hình nhận thông báo và gửi qua email hoặc FCM. Người dùng cần cấp quyền trên trình duyệt/thiết bị và dịch vụ Firebase/email phải hoạt động.

## Kiến trúc và công nghệ

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Web | React, TypeScript, Vite, React Router | Trang giới thiệu, tài khoản, dashboard, mua sắm và quản trị |
| Giao diện web | Tailwind CSS, Recharts, Lucide React | Kiểu dáng, biểu đồ, biểu tượng |
| Backend | Node.js, Express | API, xác thực vai trò, MQTT, lịch và cảnh báo |
| Lưu trữ/xác thực | Supabase | Dữ liệu nghiệp vụ, hồ sơ và phiên đăng nhập |
| Giao tiếp IoT | MQTT qua TLS | Nhận telemetry, gửi lệnh |
| Thông báo | Firebase Cloud Messaging | Push cho web và ứng dụng di động |
| Email | Nodemailer/Gmail SMTP hoặc Brevo API | Gửi email cảnh báo |
| Ứng dụng di động | Flutter, Dart | Khách hàng, nhân viên, quản trị, cảnh báo và điều khiển |

## Cài đặt và chạy từ đầu

### 1. Chuẩn bị các dịch vụ

Chuẩn bị dự án Supabase, schema và migration phù hợp; broker MQTT; Firebase nếu cần push; dịch vụ email nếu cần cảnh báo email. `schema.sql` và thư mục `migrations/` mô tả cơ sở dữ liệu. Trước khi áp dụng migration lên môi trường có dữ liệu, hãy xem thứ tự và đối chiếu schema hiện tại.

### 2. Backend

```bash
cd AquaCare_Backend
npm install
```

Tạo `.env` theo bảng biến môi trường bên dưới, sau đó chạy:

```bash
node server.js
```

Mặc định API chạy tại `http://localhost:5000`. Kiểm tra `http://localhost:5000/api/health`. Backend cần truy cập Supabase và broker để xử lý dữ liệu/thiết bị. Firebase Admin cần `FIREBASE_SERVICE_ACCOUNT` hoặc service account tại đường dẫn mà module cấu hình yêu cầu.

### 3. Web

```bash
cd AquaCare_Web
npm install
npm run dev
```

Tạo `.env.local` với URL backend local và thông tin Supabase. Mở địa chỉ Vite in trong terminal, thông thường `http://localhost:5173`. Nếu API bị chặn, kiểm tra `VITE_API_URL` và danh sách CORS của backend.

Lệnh khác:

```bash
npm run build
npm run preview
```

### 4. Flutter

Tạo `AquaCare_App/.env` với Supabase URL/anon key, rồi chạy:

```bash
cd AquaCare_App
flutter pub get
flutter run
```

Nếu chạy Android emulator, `localhost` trong emulator không đại diện cho máy host. Dùng địa chỉ host phù hợp để gọi backend local. URL dashboard admin có thể truyền như sau:

```bash
flutter run --dart-define=ADMIN_DASHBOARD_API_URL=http://localhost:5000
```

### 5. Kiểm tra tích hợp

- Kiểm tra `/api/health` trả thành công.
- Đăng nhập tài khoản có vai trò đã thiết lập.
- Đảm bảo bể có thiết bị gán và thiết bị có MAC chính xác.
- Xác nhận topic/payload MQTT khớp firmware.
- Kiểm tra telemetry và cảnh báo được ghi vào Supabase.
- Thử điều khiển trong môi trường phát triển và xác minh trạng thái thực tế phần cứng.
- Cấp quyền thông báo và kiểm tra token FCM.

## API hiện có

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Đăng ký tài khoản |
| `POST` | `/api/auth/login` | Đăng nhập |
| `GET` | `/api/admin/dashboard` | Tổng hợp dashboard, yêu cầu token và vai trò admin |
| `POST` | `/api/device/relay` | Điều khiển relay qua MQTT |
| `POST` | `/api/device/command` | Chuyển lệnh thô qua MQTT |

Ví dụ health check:

```http
GET /api/health
```

Ví dụ điều khiển relay:

```http
POST /api/device/relay
Content-Type: application/json

{
  "tank_id": "<tank-id>",
  "pin": 1,
  "state": true,
  "relay_field": "<device-relay-column>"
}
```

Ví dụ gửi lệnh thô:

```http
POST /api/device/command
Content-Type: application/json

{
  "tank_id": "<tank-id>",
  "command": "<command-expected-by-firmware>"
}
```

Các trường đăng ký/đăng nhập cụ thể được định nghĩa trong `AquaCare_Backend/controllers/auth.controller.js`. Payload API chỉ là ví dụ cấu trúc; cần đối chiếu với schema và firmware đang dùng.

## Cấu trúc mã nguồn

### Backend

- `server.js`: khởi tạo Express, CORS, endpoint thiết bị, MQTT subscriber, telemetry và cảnh báo.
- `routes/auth.routes.js`, `controllers/auth.controller.js`: định tuyến và xử lý xác thực.
- `routes/admin-dashboard.routes.js`: API dashboard admin và xác minh quyền.
- `config/supabase.js`: Supabase client phía server.
- `config/species_thresholds.js`: truy vấn ngưỡng theo loài.
- `config/mailer.js`, `config/fcm.js`: gửi email và push.
- `timer_worker.js`: tác vụ lịch.
- `hardware_simulator.js`: mô phỏng telemetry.
- `test/`: kiểm tra worker, mailer, dashboard admin.

### Web

- `src/App.tsx`: routes và kiểm tra vai trò.
- `src/pages/`: dashboard, đăng nhập/đăng ký, nhân viên, admin, giỏ hàng, khôi phục mật khẩu.
- `src/components/`: trang chủ, sản phẩm, gói dịch vụ, biểu đồ, điều khiển và thành phần giao diện.
- `src/contexts/CartContext.tsx`: trạng thái giỏ hàng.
- `src/config/firebase.js`: Firebase Messaging phía web.
- `tests/`: kiểm tra tiện ích thời gian lịch thiết bị.

### Flutter

- `lib/main.dart`: khởi tạo ứng dụng, Supabase, Firebase và phiên đăng nhập.
- `lib/screens/`: tổng quan, cảnh báo, điều khiển, admin, nhân viên, đăng nhập và đăng ký.
- `lib/services/supabase_service.dart`: thao tác dữ liệu và gọi dịch vụ backend.
- `lib/services/fcm_service.dart`: đăng ký và đồng bộ FCM.
- `lib/models/`: mô hình bể, thiết bị, cảm biến, loài, đơn hàng, nhân viên và gói dịch vụ.
- `lib/widgets/`: điều hướng, biểu đồ và xem lịch sử chi tiết.

## Hướng dẫn sử dụng theo vai trò

### Khách hàng

1. Đăng ký hoặc đăng nhập bằng tài khoản được cấp.
2. Mở dashboard và chọn bể cần theo dõi.
3. Xem chỉ số môi trường, trạng thái và biểu đồ lịch sử.
4. Mở mục cảnh báo để kiểm tra chỉ số cần chú ý.
5. Gửi lệnh điều khiển khi tài khoản và thiết bị được cấp quyền.
6. Cho phép thông báo để nhận push trên thiết bị.
7. Trên web, xem thêm sản phẩm, gói dịch vụ và giỏ hàng.

### Nhân viên

1. Đăng nhập tài khoản nhân viên.
2. Mở khu vực nhân viên được phân công.
3. Theo dõi công việc và trạng thái đơn hàng.
4. Cập nhật nghiệp vụ theo quyền được cấp.

### Quản trị viên

1. Đăng nhập tài khoản admin.
2. Xem dashboard vận hành.
3. Quản lý loài và ngưỡng môi trường.
4. Kiểm tra thiết bị trong kho, đã mua và đã gán bể.
5. Quản lý nhân viên và vai trò.
6. Theo dõi đơn hàng và gói dịch vụ.
7. Kiểm tra cảnh báo, log backend và tình trạng kết nối khi xử lý sự cố.

## Biến môi trường

### Backend

| Biến | Mục đích |
|---|---|
| `PORT` | Cổng HTTP, mặc định `5000` |
| `SUPABASE_URL` | URL dự án Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Khóa server để truy cập Supabase; giữ bí mật |
| `EMAIL_USER` | Tài khoản SMTP khi gửi email local |
| `EMAIL_PASS` | Mật khẩu ứng dụng SMTP |
| `BREVO_API_KEY` | Chuyển gửi email qua Brevo API HTTPS |
| `ALERT_EMAIL_FROM` | Sender đã xác minh của Brevo |
| `FIREBASE_SERVICE_ACCOUNT` | JSON một dòng cho Firebase Admin |

Broker MQTT hiện được cấu hình trực tiếp trong `AquaCare_Backend/server.js`. Kiểm tra và chuyển cấu hình sang biến môi trường trước khi triển khai broker riêng.

### Web

| Biến | Mục đích |
|---|---|
| `VITE_API_URL` | URL backend |
| `VITE_SUPABASE_URL` | URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | Khóa anon/public của Supabase |

### Flutter

| Biến | Mục đích |
|---|---|
| `SUPABASE_URL` | URL Supabase |
| `SUPABASE_ANON_KEY` | Khóa anon/public của Supabase |
| `ADMIN_DASHBOARD_API_URL` | URL dashboard backend, truyền bằng Dart define |

## Bảng dữ liệu theo nghiệp vụ

Schema hiện có các nhóm bảng chính:

- Người dùng và vai trò: `users`.
- Dịch vụ: `subscriptions`, `subscription_plans`, `user_subscriptions`.
- Loài nuôi: `fish_species`.
- Bể và thiết bị: `tanks`, `devices`.
- Telemetry: `telemetry_logs`.
- Cảnh báo: `alerts_history`, `notifications`, `tank_notification_settings`.
- Nhật ký thiết bị: `relay_logs`, `mqtt_messages`.
- Thương mại: `products`, `orders`, `order_items`, `cart_items`.
- Vận hành: `tasks`, `support_requests`, `device_schedules`.

Tên bảng chỉ mô tả nhóm dữ liệu. Kiểm tra `schema.sql` và `migrations/` để biết chính xác cột, khóa ngoại, chỉ mục, chính sách truy cập và thứ tự áp dụng.

## Kiểm tra và phát triển

```bash
# Backend
cd AquaCare_Backend
node --test

# Web
cd AquaCare_Web
npm run build
node --test tests/deviceScheduleTime.test.mjs

# Flutter
cd AquaCare_App
flutter analyze
flutter test
```

Backend hiện chưa khai báo script `test` riêng trong `package.json`; `node --test` chạy các bài kiểm tra tích hợp. Kết quả còn phụ thuộc phiên bản runtime, cấu hình môi trường và dịch vụ ngoài.

Quy trình phát triển gợi ý:

1. Xác định thay đổi thuộc web, backend, Flutter hay cơ sở dữ liệu.
2. Đọc các truy vấn và migration liên quan trước khi đổi mô hình dữ liệu.
3. Cập nhật cấu hình mẫu/tài liệu khi bổ sung biến môi trường; không lưu bí mật trong Git.
4. Kiểm tra payload MQTT và API giữa các thành phần.
5. Chạy kiểm tra phù hợp với phần thay đổi.
6. Cập nhật README khi cách chạy, API hoặc chức năng thay đổi.

## Xử lý sự cố

### Backend không chạy

- Kiểm tra phiên bản Node.js và cài dependency bằng `npm install`.
- Kiểm tra `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`.
- Xem lỗi đầu tiên trong terminal để tìm module hoặc cấu hình Firebase còn thiếu.

### Web không tải được dữ liệu

- Kiểm tra URL/anon key Supabase và `VITE_API_URL`.
- Xem tab Network/Console để phân biệt lỗi CORS, xác thực, URL hoặc truy vấn.
- Đảm bảo origin Vite nằm trong danh sách cho phép của backend.

### Flutter không kết nối Supabase

- Xác nhận `AquaCare_App/.env` tồn tại và được khai báo trong assets của `pubspec.yaml`.
- Kiểm tra chính tả `SUPABASE_URL` và `SUPABASE_ANON_KEY`.
- Chạy lại `flutter pub get`; xác nhận emulator/thiết bị có mạng.

### Không có telemetry

- Kiểm tra điện, mạng, broker và log kết nối MQTT.
- Xác minh topic/payload firmware và địa chỉ MAC.
- Đảm bảo thiết bị đã tồn tại, được gán bể và backend có quyền ghi bảng lịch sử.

### Lệnh không tới thiết bị

- Kiểm tra `tank_id`, MAC, topic, chân relay và tên `relay_field`.
- Xác nhận thiết bị trực tuyến và firmware hiểu đúng định dạng lệnh.
- Đối chiếu log server với trạng thái phần cứng thực tế.

### Không nhận thông báo

- Kiểm tra cảnh báo đã được tạo và cooldown đã hết chưa.
- Kiểm tra cài đặt thông báo bể, quyền thông báo và FCM token.
- Kiểm tra service account Firebase, cấu hình SMTP/Brevo và log dịch vụ gửi.

## Bảo mật và vận hành production

- Không commit `.env`, service role key, Firebase service account hoặc mật khẩu email.
- Chỉ đặt anon key ở client; không đưa service role key vào web hay Flutter.
- Cấu hình Row Level Security và quyền dữ liệu Supabase theo vai trò.
- CORS phải giới hạn đúng domain triển khai.
- Credential MQTT hiện nằm trực tiếp trong mã backend; nếu repository từng được chia sẻ, hãy thu hồi/thay credential, chuyển sang biến môi trường và kiểm tra lịch sử Git.
- `.env` Flutter được bundle như asset theo cấu hình hiện tại; không lưu khóa bí mật trong client vì có thể bị trích xuất.
- Tách dữ liệu phát triển/production và cấp quyền tối thiểu cho từng khóa dịch vụ.
- Theo dõi log, trạng thái broker, lịch gửi telemetry, lịch sử cảnh báo và tình trạng email/FCM.
- Kiểm tra schema, chính sách RLS, vai trò và luồng điều khiển trên môi trường thử nghiệm trước khi đưa vào sử dụng thật.

## Tài liệu liên quan

- `schema.sql`: cấu trúc cơ sở dữ liệu.
- `migrations/`: các thay đổi schema theo phiên bản.
- `database.txt`: ghi chú về cơ sở dữ liệu.
- `AquaCare_Backend/ALERT_EMAIL.md`: cấu hình email cảnh báo.
- `AquaCare_App/README.md`: hướng dẫn Flutter.
- `AquaCare_Backend/test/`, `AquaCare_Web/tests/`: các bài kiểm tra có trong repository.
