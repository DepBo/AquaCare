const fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/Acer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const o=[`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1550"><defs><marker id="a" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M1 1 L11 6 L1 11" fill="none" stroke="#475569" stroke-width="1.5"/></marker></defs><style>text{font-family:Arial,'Segoe UI',sans-serif;fill:#18364a}.e{fill:none;stroke:#8798aa;stroke-width:1.7}.r{fill:none;stroke:#475569;stroke-width:1.8;stroke-dasharray:7 5;marker-end:url(#a)}</style><rect width="1800" height="1550" fill="white"/><rect x="290" y="115" width="1225" height="1190" rx="6" fill="#fcfefe" stroke="#64748b" stroke-width="2"/>`];
function t(x,y,s,size=21){s.split('\n').forEach((v,i)=>o.push(`<text x="${x}" y="${y+i*26}" text-anchor="middle" font-size="${size}">${esc(v)}</text>`));}
function e(d,c='e'){o.push(`<path d="${d}" class="${c}"/>`);}
function uc(x,y,s){o.push(`<ellipse cx="${x}" cy="${y}" rx="210" ry="43" fill="#f0fdfa" stroke="#0f766e" stroke-width="2"/>`);t(x,y+7-(s.split('\n').length-1)*13,s,22);}
function a(x,y,s){o.push(`<g fill="white" stroke="#334155" stroke-width="2.4"><circle cx="${x}" cy="${y-30}" r="13"/><path d="M${x} ${y-17}v43 m-25,-29 h50 m-25,29 l-22,29 m22,-29 l22,29" fill="none"/></g>`);t(x,y+80,s,20);}
t(900,46,'AQUACARE · Tiếp nhận dữ liệu và tự động hóa',31);t(900,80,'Backend và bộ chạy lịch nằm trong AquaCare; các thiết bị / dịch vụ tích hợp là actor ngoài.',19);t(900,145,'HỆ THỐNG AQUACARE',20);
a(135,240,'Thiết bị IoT');uc(570,240,'Tiếp nhận dữ liệu\ncảm biến');uc(1170,200,'Lưu dữ liệu cảm biến');uc(1170,345,'Đánh giá ngưỡng loài\nvà trạng thái mực nước');uc(1170,535,'Ghi nhận cảnh báo\nvào lịch sử');uc(570,720,'Gửi thông báo cảnh báo');uc(1170,720,'Gửi email cảnh báo');uc(1170,890,'Gửi thông báo web / app');
a(135,720,'Khách hàng\n(người nhận)');a(1660,720,'Dịch vụ email');a(1660,890,'Firebase FCM');
e('M160 240 H360');e('M780 240 L960 200','r');t(865,205,'<<include>>',17);e('M780 240 L960 345','r');t(865,280,'<<include>>',17);
e('M1170 492 V388','r');t(1315,430,'<<extend>>',17);t(1315,457,'[bất thường]',17);
e('M570 677 V535 H960','r');t(720,518,'<<extend>>',17);t(570,604,'[đúng bộ lọc, hết cooldown]',17);
e('M160 720 H360');e('M960 720 H780','r');t(865,703,'<<extend>>',17);t(1170,785,'[bật email, có địa chỉ nhận]',17);
e('M960 890 H840 V750 H720','r');t(875,871,'<<extend>>',17);t(1170,956,'[bật kênh, có token]',17);e('M1380 720 H1635');e('M1380 890 H1635');
a(135,1110,'Thiết bị IoT');uc(570,1110,'Thực hiện lệnh theo lịch');uc(1170,1050,'Gửi lệnh điều khiển\nqua MQTT');uc(1170,1210,'Cập nhật trạng thái\nvà ghi log AUTO');e('M160 1110 H360');e('M780 1110 L960 1050','r');e('M780 1110 L960 1210','r');t(865,1065,'<<include>>',17);t(865,1152,'<<include>>',17);
t(900,1345,'Điều kiện và phạm vi',23);t(900,1380,'Dữ liệu hợp lệ từ thiết bị đã đăng ký, đang hoạt động mới được tiếp nhận và đánh giá.',19);t(900,1410,'Lưu cảnh báo độc lập với việc gửi thông báo; email, web và app chỉ gửi theo cấu hình.',19);t(900,1440,'Lệnh theo lịch: đến hạn, thiết bị hoạt động, trạng thái cần đổi. Timer là thành phần nội bộ.',19);t(900,1470,'Nếu trạng thái đã đúng: worker chỉ đánh dấu lịch đã xử lý, không phát lệnh lại.',19);t(900,1500,'Actor Thiết bị IoT được lặp vị trí để dễ đọc; vẫn là cùng một loại actor.',18);o.push('</svg>');
const stem=path.join(__dirname,'05-tu-dong-hoa');const svg=o.join('\n');fs.writeFileSync(stem+'.svg',svg);sharp(Buffer.from(svg)).png().toFile(stem+'.png');
fs.writeFileSync(stem+'.puml',`@startuml
left to right direction
skinparam shadowing false
actor "Thiết bị IoT" as IoT
actor "Khách hàng (người nhận)" as Customer
actor "Dịch vụ email" as Email
actor "Firebase FCM" as FCM
rectangle AquaCare {
usecase "Tiếp nhận dữ liệu cảm biến" as Receive
usecase "Lưu dữ liệu cảm biến" as Store
usecase "Đánh giá ngưỡng loài và mực nước" as Evaluate
usecase "Ghi nhận cảnh báo vào lịch sử" as Alert
usecase "Gửi thông báo cảnh báo" as Notify
usecase "Gửi email cảnh báo" as SendEmail
usecase "Gửi thông báo web / app" as Push
usecase "Thực hiện lệnh theo lịch" as Scheduled
usecase "Gửi lệnh điều khiển qua MQTT" as Command
usecase "Cập nhật trạng thái và ghi log AUTO" as Log
}
IoT -- Receive
IoT -- Scheduled
Customer -- Notify
Email -- SendEmail
FCM -- Push
Receive ..> Store : <<include>>
Receive ..> Evaluate : <<include>>
Alert ..> Evaluate : <<extend>>\\n[bất thường]
Notify ..> Alert : <<extend>>\\n[đúng bộ lọc, hết cooldown]
SendEmail ..> Notify : <<extend>>\\n[bật email, có địa chỉ]
Push ..> Notify : <<extend>>\\n[bật kênh, có token]
Scheduled ..> Command : <<include>>
Scheduled ..> Log : <<include>>
note bottom of Scheduled
Đến hạn, thiết bị hoạt động, trạng thái cần đổi.
Nếu trạng thái đã đúng: chỉ đánh dấu đã xử lý.
end note
@enduml
`);
