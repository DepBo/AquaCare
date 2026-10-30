const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const isV2 = process.argv[4] === 'v2';
const dir = path.join(root, 'test-results', isV2 ? 'quick-v2' : 'quick');
const evidenceDir = path.join(dir, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });
const read = name => fs.existsSync(path.join(dir, name)) ? fs.readFileSync(path.join(dir, name), 'utf8').replace(/^\uFEFF/, '') : '';
const clean = value => String(value ?? '').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ').trim();
const backendLog = read('backend.log');
const flutterLog = read('flutter.jsonl');
const backend = [];
for (const line of backendLog.split(/\r?\n/)) {
  const match = /^\s*([✔✖]|Γ£ö|Γ£û)\s+(.+?)(?:\s+\([\d.]+ms\))?\s*$/.exec(line);
  if (!match) continue;
  backend.push({ name: match[2], status: ['✔', 'Γ£ö'].includes(match[1]) ? 'PASS' : 'FAIL', source: 'AquaCare_Backend/test/ hoặc tests/', detail: line.trim() });
}

const flutterStarts = new Map();
const flutterErrors = new Map();
const flutter = [];
for (const line of flutterLog.split(/\r?\n/)) {
  let event;
  try { event = JSON.parse(line); } catch { continue; }
  if (event.type === 'testStart') flutterStarts.set(event.test.id, event.test);
  if (event.type === 'error') {
    const errors = flutterErrors.get(event.testID) || [];
    errors.push([event.error, event.stackTrace].filter(Boolean).join('\n'));
    flutterErrors.set(event.testID, errors);
  }
  if (event.type === 'testDone') {
    const started = flutterStarts.get(event.testID);
    if (!started || event.hidden || started.name.startsWith('loading ')) continue;
    flutter.push({
      name: started.name,
      status: event.result === 'success' && !event.skipped ? 'PASS' : event.skipped ? 'SKIP' : 'FAIL',
      source: started.root_url?.replace(/^file:\/\//, '') || 'AquaCare_App/test/',
      detail: [`Result: ${event.result}`, ...(flutterErrors.get(event.testID) || [])].join('\n'),
    });
  }
}

const all = [
  ...backend.map((item, index) => ({ ...item, id: `BE-${String(index + 1).padStart(2, '0')}` })),
  ...flutter.map((item, index) => ({ ...item, id: `MOB-${String(index + 1).padStart(2, '0')}` })),
];
for (const item of all) {
  fs.writeFileSync(path.join(evidenceDir, `${item.id}.txt`),
    `${item.id} — ${item.name}\nStatus: ${item.status}\nSource: ${item.source}\n\n${item.detail}\n`, 'utf8');
}
const counts = status => all.filter(item => item.status === status).length;
const expectedBackend = isV2 ? 30 : 21;
const expectedFlutter = isV2 ? 83 : 76;
const backendExit = Number(process.argv[2]);
const flutterExit = Number(process.argv[3]);
const lines = [
  `# AquaCare — kết quả test nhanh ${isV2 ? 'V2' : 'V1'}`,
  '',
  `Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
  '',
  `**${all.length} bài đã ghi nhận: ${counts('PASS')} PASS, ${counts('FAIL')} FAIL, ${counts('SKIP')} SKIP${backend.length === expectedBackend && flutter.length === expectedFlutter ? '.' : ' — CHƯA ĐỦ BỘ, KHÔNG DÙNG LÀM KẾT QUẢ TỔNG.'}**`,
  '',
  `Backend: ${backend.length}/${expectedBackend} bài, exit code ${backendExit}. Flutter: ${flutter.length}/${expectedFlutter} bài, exit code ${flutterExit}.`,
  '',
  'Bộ này chạy unit/widget test không cần Docker. Evidence là kết quả runner và thông báo lỗi của từng bài, không phải ảnh chụp thao tác trên thiết bị.',
  '',
  '| Mã | Test về cái gì | Kết quả | Evidence |',
  '|---|---|---|---|',
  ...all.map(item => `| ${item.id} | ${clean(item.name)} | ${item.status === 'PASS' ? '✅ PASS' : item.status === 'FAIL' ? '❌ FAIL' : '⏭️ SKIP'} | [Xem log](evidence/${item.id}.txt) |`),
  '',
  'Log đầy đủ: [Backend](backend.log) · [Flutter](flutter.jsonl).',
];
if (backend.length !== expectedBackend || flutter.length !== expectedFlutter) {
  lines.splice(8, 0, '**Lưu ý:** Số bài ghi nhận khác dự kiến; kiểm tra log và trạng thái chạy trước khi trình bày.');
}
fs.writeFileSync(path.join(dir, 'results.md'), lines.join('\n') + '\n', 'utf8');
console.log(`Quick report: ${path.join(dir, 'results.md')} — ${counts('PASS')} PASS, ${counts('FAIL')} FAIL, ${counts('SKIP')} SKIP`);
if (backendExit !== 0 || flutterExit !== 0 || backend.length !== expectedBackend || flutter.length !== expectedFlutter) process.exitCode = 1;
