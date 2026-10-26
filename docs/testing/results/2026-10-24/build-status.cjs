const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const spec = fs.readFileSync(path.join(root, 'AQUACARE_SYSTEM_TEST_CASES.md'), 'utf8');
const cases = spec.split(/\r?\n/).filter(x => /^\| [A-Z]+-\d{2} \|/.test(x)).map(line => {
  const cells = line.split('|').slice(1, -1).map(x => x.trim());
  return { id: cells[0], platform: cells[1], steps: cells[2], expected: cells[3] };
});
const auto = [];
for (const [file, prefix] of [['backend.tap', 'BE'], ['web.tap', 'WEB']]) {
  const tap = fs.readFileSync(path.join(__dirname, file), 'utf8');
  let n = 0;
  for (const line of tap.split(/\r?\n/)) {
    const match = /^(ok|not ok) \d+ - (.+)$/.exec(line);
    if (match) auto.push({id: `${prefix}-${String(++n).padStart(2, '0')}`, name: match[2], result: match[1] === 'ok' ? 'PASS' : 'FAIL', evidence: file});
  }
}
const flutter = JSON.parse(fs.readFileSync(path.join(__dirname, 'flutter-results.json'), 'utf8').replace(/^\uFEFF/, ''));
flutter.forEach((test, i) => auto.push({id: `FL-${String(i + 1).padStart(2, '0')}`, name: test.name, result: test.skipped ? 'SKIPPED' : test.result === 'success' ? 'PASS' : 'FAIL', evidence: 'flutter-results.json', source: test.source}));
const links = {};
function map(ids, predicate, missing) {
  const matches = auto.filter(predicate);
  if (!matches.length) throw new Error(`No evidence: ${ids}`);
  for (const id of ids.split(' ')) {
    links[id] ??= { tests: [], missing: [] };
    links[id].tests.push(...matches.map(t => t.id));
    links[id].missing.push(missing);
  }
}
const be = n => t => t.id === `BE-${String(n).padStart(2, '0')}`;
const name = text => t => t.name.includes(text);
map('REV-01 REV-02 REV-03 REV-12', be(1), 'Test hàm dùng bộ số liệu khác; chưa chạy đủ dữ liệu REV/VERSION và cả giao diện web/mobile.');
map('REV-05 REV-10', be(2), 'Mới kiểm tra dữ liệu rỗng; chưa đủ đồng hạng, chỉ tăng/giảm và các biến thể thời gian.');
map('REV-07 REV-19', be(3), 'Mới kiểm tra hàm với fixture; chưa truy vấn database và đối chiếu UI.');
map('SEC-01', t => ['BE-04','BE-05'].includes(t.id), 'HTTP loopback với Auth giả lập; chưa token hết hạn và quyền trên môi trường thật.');
map('REV-09', be(5), 'Mới thử year hợp lệ/banana và quyền; chưa đủ mặc định,1999,năm tương lai,số thập phân,tham số lặp.');
map('ALERT-06 ALERT-07', t => ['BE-06','BE-07'].includes(t.id), 'Chỉ Brevo fake fetch; chưa cấu hình kênh,FCM,SMTP,token,cooldown và gửi thật.');
map('SCH-03 SCH-04 SCH-07', be(8), 'Mới once ON Pump bằng fake MQTT/DB; chưa đủ relay,OFF,restart và tải thật.');
map('SCH-02 SCH-04', be(9), 'Mới lịch daily Light ON hai ngày; chưa UI,DB thật,OFF và restart.');
map('SCH-05', t => t.id === 'BE-10' || t.id === 'WEB-03', 'Mới hàm tính thời gian qua ngày; chưa trọn luồng lưu,ON/OFF,hoàn tất và thiết bị.');
map('SCH-11', be(11), 'Mới once trễ1/3 phút và ngày sau; chưa mốc2 phút và daily trễ.');
map('SCH-03 SCH-14', be(12), 'Mới retry update DB sau OFF Aerator; chưa các lỗi publish,log,schedule và tải thật.');
map('SCH-12 OPS-03', be(13), 'Mới inactive/disconnected MQTT; chưa mất tank/MAC,reconnect,DB outage và server chạy thật.');
map('UPD-01', name('old build cannot reach'), 'Widget gate chặn nội dung; chưa APK release,Back/deep link và session thật.');
map('UPD-02', t => /minimum build blocks|current build opens/.test(t.name), 'Mới service/widget test; chưa xác minh APK đã cài.');
map('UPD-05', name('failed check blocks'), 'Mới lỗi check giả lập và retry; chưa đủ timeout,HTTP,JSON và schema manifest.');
map('UPD-06', name('returning to app'), 'Lifecycle giả lập; chưa thiết bị thật,request chồng và dispose.');
map('REV-20', name('revenue panels fit'), 'Mới layout widget ở các độ rộng/theme; chưa web,tooltip,filter và mở từng tháng.');
map('REV-10', name('missing months and empty'), 'Mới hiển thị fixture rỗng/thiếu tháng; chưa API và năm hiện tại đầy đủ.');
map('DATA-05 DATA-06', t => /species range|other sensors use/.test(t.name), 'Chỉ Flutter với giá trị mẫu; chưa đủ biên và đồng nhất backend/web.');
map('DATA-07', name('missing species preserves'), 'Mới thiếu loài; chưa null,min≥max,lỗi truy vấn và các nền tảng.');
map('DATA-08 DATA-09', name('shield uses'), 'Mới ưu tiên trạng thái khiên; chưa telemetry,phục hồi và chuyển bể thực tế.');
map('TANK-12', t => /hero fits|shield images|nine pond photos|add tank button|slideshow cycles/.test(t.name), 'Mới asset/widget/timer; chưa kiểm tra thị giác/cutout và trải nghiệm cả web/mobile.');
map('NAV-05', t => /splash finishes|Get Started opens|onboarding fits/.test(t.name), 'Mới widget splash/onboarding; chưa cài mới,persistence,auth và Back trên app.');
map('TANK-01 TANK-09', name('tank creation persists'), 'Mới service với HTTP mock; chưa empty state,modal hủy/xác nhận và DB thật.');
map('TANK-03', name('tank creation saves details'), 'Mới request mock tạo bể và gán thiết bị; chưa DB,loài và cả web/mobile.');
map('SCH-01 SCH-17', name('mobile relay schedules write'), 'Mới payload mobile mock; chưa reload,DB đã drop cột và worker.');
map('AUTH-12', name('forgot password action'), 'Chỉ mở form recovery; chưa gửi email,mở link,đổi mật khẩu và đăng nhập.');
map('OPS-05', t => /fit|compact phone|theme is restored/.test(t.name), 'Nhiều widget mobile đã kiểm tra kích thước; chưa toàn bộ màn,web,keyboard,landscape và thiết bị thật.');
map('OPS-07', name('slideshow cycles'), 'Mới dispose timer slideshow; chưa chuyển tab/bể20 lần và đếm subscription/request.');

const esc = s => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const rows = cases.map(c => ({...c, status: links[c.id] ? 'CHƯA HOÀN TẤT' : 'CHƯA CHẠY', evidence: [...new Set(links[c.id]?.tests || [])], remaining: [...new Set(links[c.id]?.missing || [])].join(' ')}));
const partial = rows.filter(r => r.evidence.length).length;
const summary = `| PASS toàn ca hệ thống | FAIL được xác nhận | Chưa hoàn tất (có bằng chứng một phần) | Chưa chạy | Tổng |\n|---:|---:|---:|---:|---:|\n| 0 | 0 | ${partial} | ${rows.length - partial} | ${rows.length} |`;
let md = `# Bảng trạng thái178 test case AquaCare\n\nNgày đối chiếu:24/10/2026. Dữ liệu từ lần chạy được lưu trong [báo cáo](REPORT.md); không chạy lại test khi lập bảng.\n\n90 test tự động có sẵn và178 test case hệ thống là hai tập khác nhau. Một ca hệ thống có thể cần nhiều test tự động,thao tác UI và kiểm chứng dữ liệu/thực tế. Nhiều test tự động cũng chỉ kiểm tra các kích thước khác nhau của cùng widget. Vì vậy không lấy178−90 để suy ra số ca chưa chạy.\n\n${summary}\n\n- **PASS:** đủ tất cả bước,kết quả và biến thể nền tảng đã yêu cầu.\n- **FAIL:** đã thực thi và có bằng chứng sai expected result.\n- **CHƯA HOÀN TẤT:** test liên quan có PASS nhưng chưa đủ để kết luận toàn ca.\n- **CHƯA CHẠY:** chưa có bằng chứng thực thi được ánh xạ tới ca. Không đồng nghĩa FAIL.\n\nĐợt trước đã chạy90 test tự động:90 PASS,0 FAIL. Chi tiết từng test nằm ở [bảng90 kết quả](AUTOMATED_TEST_RESULTS.md). Mã BE/WEB/FL dưới đây trỏ tới bảng đó.\n\n## Toàn bộ test case\n\n| ID | Ưu tiên / nền tảng | Kịch bản cần test | Trạng thái toàn ca | Test tự động liên quan đã PASS | Phần còn thiếu |\n|---|---|---|---|---|---|\n`;
for (const r of rows) md += `| ${r.id} | ${esc(r.platform)} | ${esc(r.steps)} | **${r.status}** | ${r.evidence.map(id => `[${id}](AUTOMATED_TEST_RESULTS.md#${id.toLowerCase()})`).join(', ') || '—'} | ${esc(r.remaining || 'Chưa thực thi kịch bản. Xem dữ liệu và expected result trong tài liệu gốc.')} |\n`;
md += '\nExpected result đầy đủ của từng ID ở [đặc tả hệ thống](../../AQUACARE_SYSTEM_TEST_CASES.md). Các ca chưa chạy vẫn là công việc cần làm; không suy ra hệ thống không có bug từ kết quả bộ test hiện hữu.\n';
fs.writeFileSync(path.join(__dirname,'TEST_CASE_STATUS.md'), md);
let detail = '# Kết quả từng test tự động đã chạy\n\nNguồn: TAP backend/web và JSON Flutter của phiên24/10/2026. ID bên dưới là mã bằng chứng của phiên,không phải ID của178 test case hệ thống.\n\n| Mã | Tên test thực tế | Kết quả | Log nguồn |\n|---|---|---|---|\n';
for(const t of auto) detail += `| <a id="${t.id.toLowerCase()}"></a>${t.id} | ${esc(t.name)} | **${t.result}** | [${t.evidence}](${t.evidence}) |\n`;
fs.writeFileSync(path.join(__dirname,'AUTOMATED_TEST_RESULTS.md'),detail);
fs.writeFileSync(path.join(__dirname,'test-case-status.json'),JSON.stringify(rows,null,2));
if(cases.length !== 178 || auto.length !== 90 || new Set(cases.map(x=>x.id)).size !== 178) throw new Error('Unexpected document/result count');
for(const id of Object.keys(links)) if(!cases.some(c=>c.id===id)) throw new Error(`Unknown case ${id}`);
console.log(JSON.stringify({systemCases:rows.length,partial,notRun:rows.length-partial,automated: auto.length,automatedPass: auto.filter(t=>t.result==='PASS').length}));
