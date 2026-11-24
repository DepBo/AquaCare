const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSdDRh5CloiPIfJsyMfGKyoqP1ZQNeyB76glfLSEWqQwj63KpQ';
const DIR = path.join(__dirname, 'form-test-output');
const ACTIONS = ['Tạo tài khoản', 'Thêm sản phẩm vào giỏ hàng và thanh toán', 'Nhận mail có chứa mã MAC', 'Thêm bể', 'Xem chỉ số hiện tại', 'Xem lịch sử dữ liệu', 'Xem cảnh báo', 'Bật/tắt/hẹn giờ thiết bị'];
const FIELDS = [
  ['name', 1402530613, 'Tên của bạn'], ['email', 1713306157, 'Email bạn dùng để đăng ký AquaCare'],
  ['phone', 134844815, 'Số điện thoại'], ['fish', 133607849, 'Bạn có đang nuôi cá hoặc từng chăm sóc bể cá không?'],
  ['platform', 1510287062, 'Bạn đã dùng thử AquaCare trên nền tảng nào?'],
  ['actions', 1190162297, 'Bạn đã thử những thao tác nào?'],
  ['difficulty', 1364122442, 'Thao tác nào bạn không hoàn thành được hoặc thấy khó?'],
  ['detail', 975924775, 'Nếu gặp khó, vấn đề cụ thể là gì?'],
  ['like', 739474720, 'Điều bạn thích nhất ở AquaCare là gì?'],
  ['dislike', 1486732, 'Điều bạn chưa hài lòng về AquaCare'],
  ['buy', 248044596, 'Nếu AquaCare hoạt động ổn định với bể cá của bạn, bạn có cân nhắc mua thiết bị không?'],
  ['recommend', 604493621, 'Bạn có sẵn sàng giới thiệu AquaCare cho người nuôi cá khác không?'],
];
const pick = xs => xs[Math.floor(Math.random() * xs.length)];
// Synthetic fixtures: vary wording without recycling sentences from saved batches.
const TEXT_BANK = {
  detail: ['không có vấn đề gì', 'không gặp vướng mắc cụ thể', 'chưa gặp lỗi khi thao tác', 'không có gì cần giải thích thêm', 'chưa thấy bước nào bị lỗi', 'các bước đều thực hiện được', 'không có khó khăn đáng kể', 'không có vấn đề cần báo lại', 'chưa ghi nhận trục trặc', 'chưa có vấn đề phát sinh', 'không bị kẹt ở bước nào', 'chưa gặp tình huống cần hỗ trợ', 'mọi thao tác vẫn thực hiện được', 'không có lỗi cụ thể để mô tả', 'chưa có gì cần phản ánh', 'chưa thấy bất tiện gì rõ rệt', 'không có vấn đề nào nổi bật', 'không gặp trở ngại khi dùng thử', 'chưa phát hiện điều gì bất thường', 'không có thêm thông tin về lỗi'],
  like: ['giao diện dễ nhìn', 'bố cục gọn gàng', 'các nút chức năng dễ tìm', 'thông số nước hiển thị rõ', 'xem lịch sử chỉ số khá tiện', 'quản lý bể cá ở một chỗ rất gọn', 'theo dõi bể từ xa thuận tiện', 'thêm bể khá nhanh', 'cách sắp xếp thông tin dễ hiểu', 'màu sắc giao diện dễ chịu', 'không mất nhiều thời gian làm quen', 'các bước đăng ký đơn giản', 'trang theo dõi chỉ số trình bày tốt', 'tìm thông tin bể cá nhanh', 'web phản hồi thao tác khá nhanh', 'chữ và số liệu dễ đọc', 'chức năng quản lý bể dễ sử dụng', 'xem dữ liệu cũ không mất công tìm', 'luồng thao tác khá liền mạch', 'thiết kế nhìn hiện đại', 'thông tin cần xem được gom gọn', 'có thể kiểm tra tình trạng bể nhanh', 'menu dễ hiểu', 'cách trình bày không bị rối', 'dễ nắm được các chỉ số chính', 'mở web là xem được thông tin bể', 'chức năng chia thành từng mục rõ ràng', 'thao tác trên web khá mượt', 'dễ tìm lại bể đã thêm', 'trải nghiệm dùng thử khá nhẹ nhàng'],
  dislike: ['chưa có điểm nào chưa hài lòng', 'hiện tại dùng khá ổn', 'chưa có góp ý thêm', 'chưa thấy điều gì bất tiện', 'không có phàn nàn gì', 'chưa có gì cần thay đổi', 'các chức năng hiện tại khá phù hợp', 'trải nghiệm tổng thể ổn', 'chưa gặp điểm nào gây khó chịu', 'nhìn chung không có vấn đề', 'chưa thấy hạn chế nào đáng kể', 'không có gì cần phản ánh', 'dùng thử thấy ổn', 'chưa có điểm nào cần góp ý', 'hiện chưa có yêu cầu cải thiện', 'không có bất tiện đáng kể', 'mọi thứ đáp ứng được nhu cầu cơ bản', 'chưa thấy mục nào cần chỉnh', 'chưa có nhận xét tiêu cực', 'tổng thể khá hài lòng'],
  criticism: ['cần hướng dẫn hẹn giờ rõ hơn', 'nên giải thích ý nghĩa từng chỉ số kỹ hơn', 'mong trang lịch sử tải nhanh hơn', 'nên có thêm hướng dẫn cho người mới', 'muốn chữ ở phần chỉ số lớn hơn', 'nên bổ sung ví dụ khi thêm bể', 'mong bộ lọc lịch sử dễ tìm hơn', 'nên làm nút lưu nổi bật hơn', 'muốn phần trợ giúp chi tiết hơn', 'mong thông báo thao tác thành công rõ hơn', 'nên có chú thích cho các đơn vị đo', 'muốn phần cài đặt được gom gọn hơn']
};
const normalizeText = value => value.normalize('NFC').trim().toLocaleLowerCase('vi');
function savedTexts() {
  const used = new Set();
  if (!fs.existsSync(DIR)) return used;
  for (const name of fs.readdirSync(DIR).filter(n => n.endsWith('.json') && n !== 'submission-history.json')) {
    const data = JSON.parse(fs.readFileSync(path.join(DIR, name), 'utf8'));
    for (const row of data.responses || []) for (const key of ['detail', 'like', 'dislike']) {
      if (typeof row[key] === 'string' && row[key].trim()) used.add(normalizeText(row[key]));
    }
  }
  return used;
}
function generate(accounts, used = new Set()) {
  const criticism = new Set(accounts.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, Math.round(accounts.length / 10)));
  const endings = ['', ' khi dùng thử', ' trong lần trải nghiệm này', ' sau khi dùng thử', ' ở lần sử dụng này', ' trong quá trình trải nghiệm', ' khi thao tác trên AquaCare', ' ở bản hiện tại', ' trong lúc dùng thử ứng dụng', ' qua lần sử dụng vừa rồi', ' ở thời điểm hiện tại', ' sau vài thao tác ban đầu'];
  function unique(kind, pronoun) {
    const phrases = [...TEXT_BANK[kind]].sort(() => Math.random() - 0.5);
    // Prefer a different core phrase before adding contextual variations.
    for (const ending of endings) for (const phrase of phrases) {
      const prefix = pronoun ? `${pronoun} thấy ` : '';
      const raw = `${prefix}${phrase}${ending}`;
      const value = raw.charAt(0).toUpperCase() + raw.slice(1);
      const key = normalizeText(value);
      if (!used.has(key)) { used.add(key); return value; }
    }
    if (kind === 'detail') return ''; // Optional: leave blank rather than repeat.
    throw new Error('Đã hết câu TEST không trùng cho kiểu xưng hô này; hãy giảm số account trong lô');
  }
  return accounts.map((a, i) => {
    const variant = Math.floor(Math.random() * 3);
    const r = Math.random();
    const voice = Math.random();
    const pronoun = voice < .7 ? '' : voice < .8 ? 'tôi' : voice < .9 ? 'tui' : 'mình';
    return { name: a.fullName, email: a.email, phone: a.phone || '', fish: 'Có',
      platform: r < .8 ? 'Web' : r < .9 ? 'Điện thoại' : 'Cả hai',
      actions: ACTIONS.filter((_, j) => variant === 0 || (variant === 1 ? j !== 6 : j < 6)),
      difficulty: [pick(['Không gặp khó khăn', ACTIONS[7], ACTIONS[6]])],
      detail: Math.random() < .3 ? '' : unique('detail', pronoun),
      like: unique('like', pronoun),
      dislike: unique(criticism.has(i) ? 'criticism' : 'dislike', pronoun),
      buy: pick(['Có', 'Cần biết thêm giá và tính năng']), recommend: 'Có' };
  });
}
function params(row) {
  const p = new URLSearchParams();
  for (const [key, id] of FIELDS) for (const v of Array.isArray(row[key]) ? row[key] : [row[key]]) {
    if (v !== '') p.append(`entry.${id}`, v);
  }
  return p;
}
async function schema() {
  const res = await fetch(`${FORM}/viewform`, { signal: AbortSignal.timeout(30000) });
  const html = await res.text();
  const match = html.match(/FB_PUBLIC_LOAD_DATA_ = ([\s\S]*?);<\/script>/);
  if (!res.ok || !match) throw new Error('Không đọc được form công khai; có thể form yêu cầu đăng nhập.');
  return JSON.parse(match[1])[1][1];
}
function validate(rows, accounts, items) {
  if (!Array.isArray(rows) || rows.length !== accounts.length) throw new Error('Số phản hồi đã thay đổi.');
  const known = new Map(accounts.map(a => [a.email, a]));
  const seen = new Set();
  for (const row of rows) {
    if (!known.has(row.email) || seen.has(row.email) || row.name !== known.get(row.email).fullName) throw new Error('Tên/email không khớp hoặc bị trùng.');
    seen.add(row.email);
    for (const key of ['detail', 'like', 'dislike']) {
      if (typeof row[key] === 'string' && /[.\u2026]\s*$/u.test(row[key])) {
        throw new Error(`Câu trả lời ${key} không được có dấu chấm cuối câu; hãy sửa file JSON rồi duyệt lại`);
      }
    }
    for (const [key, id] of FIELDS) {
      const item = items.find(q => q[4]?.[0]?.[0] === id);
      if (!item) throw new Error(`Form đã thay đổi: ${key}`);
      const field = item[4][0];
      const values = Array.isArray(row[key]) ? row[key] : [row[key]];
      if (values.some(v => typeof v !== 'string') || (field[2] && (!values.length || values.some(v => !v.trim())))) throw new Error(`Thiếu/sai dữ liệu: ${key}`);
      if (item[3] === 4 && !Array.isArray(row[key])) throw new Error(`Cần danh sách checkbox: ${key}`);
      if (field[1] && values.some(v => !field[1].some(o => o[0] === v))) throw new Error(`Đáp án không hợp lệ: ${key}`);
    }
  }
}
function preview(rows, file) {
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  fs.writeFileSync(file, '<!doctype html><meta charset="utf-8"><title>AquaCare — dữ liệu TEST</title><style>body{font:16px Arial;max-width:950px;margin:30px auto}article{border:1px solid #ccc;padding:20px;margin:20px 0}dt{font-weight:bold;margin-top:12px}dd{white-space:pre-wrap}</style><h1>Dữ liệu tổng hợp để TEST</h1><p>Các câu trả lời này không phải đánh giá thật của người dùng.</p>' + rows.map((r, i) => `<article><h2>${i + 1}. ${escape(r.name)}</h2><dl>${FIELDS.map(([k,,q]) => `<dt>${escape(q)}</dt><dd>${escape(Array.isArray(r[k]) ? r[k].join('\n') : r[k] || '(bỏ trống)')}</dd>`).join('')}</dl><a href="${escape(`${FORM}/viewform?usp=pp_url&${params(r)}`)}" target="_blank">Mở form điền sẵn (chưa gửi)</a></article>`).join(''), 'utf8');
}
async function runFormMode(rl) {
  const source = path.join(__dirname, 'seeded-users-log.json');
  const raw = JSON.parse(fs.readFileSync(source, 'utf8'));
  const unique = new Map();
  for (const a of raw) if (['completed', 'registered_only'].includes(a.status) && a.email && a.fullName) unique.set(a.email.toLowerCase(), { ...a, email: a.email.toLowerCase() });
  fs.mkdirSync(DIR, { recursive: true });
  const journalFile = path.join(DIR, 'submission-history.json');
  const history = fs.existsSync(journalFile) ? JSON.parse(fs.readFileSync(journalFile, 'utf8')) : [];
  const used = new Set(history.filter(h => h.form === FORM).map(h => h.email));
  const available = [...unique.values()].filter(a => !used.has(a.email));
  console.log(`\nDỮ LIỆU TEST TỔNG HỢP. Có ${available.length} account chưa gửi (loại cả trạng thái chưa rõ để tránh trùng).`);
  const n = Number((await rl.question('Số account muốn điền: ')).trim());
  if (!Number.isInteger(n) || n < 1 || n > available.length) throw new Error('Số lượng không hợp lệ.');
  const accounts = available.slice(0, n);
  const rows = generate(accounts, savedTexts());
  const batch = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const jsonFile = path.join(DIR, `${batch}.json`);
  const htmlFile = path.join(DIR, `${batch}.html`);
  fs.writeFileSync(jsonFile, JSON.stringify({ syntheticTestData: true, form: FORM, responses: rows }, null, 2));
  preview(rows, htmlFile);
  rows.forEach((r, i) => console.log(`\n[${i + 1}] ` + FIELDS.map(([k,,q]) => `${q}: ${Array.isArray(r[k]) ? r[k].join('; ') : r[k] || '(bỏ trống)'}`).join('\n')));
  console.log(`\nXem trước: ${htmlFile}\nCó thể sửa câu trả lời trong: ${jsonFile}\nKhông chứa mật khẩu. Chưa gửi phản hồi nào.`);
  const answer = (await rl.question('Sau khi duyệt, gõ GUI TEST để gửi cả lô; Enter = chỉ lưu: ')).trim();
  if (answer !== 'GUI TEST') return;
  const reviewed = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  if (reviewed.form !== FORM || reviewed.syntheticTestData !== true) throw new Error('Sai thông tin lô TEST.');
  const finalRows = reviewed.responses;
  validate(finalRows, accounts, await schema());
  preview(finalRows, htmlFile);
  for (const row of finalRows) {
    const entry = { form: FORM, batch, email: row.email, status: 'pending', at: new Date().toISOString() };
    history.push(entry);
    fs.writeFileSync(journalFile, JSON.stringify(history, null, 2));
    try {
      const res = await fetch(`${FORM}/formResponse`, { method: 'POST', body: params(row), signal: AbortSignal.timeout(30000) });
      const body = await res.text();
      if (!res.ok || !/freebirdFormviewerViewResponseConfirmationMessage|vHW8K/.test(body)) throw new Error(`Chưa xác nhận được gửi thành công (HTTP ${res.status}).`);
      entry.status = 'submitted';
      console.log(`Đã gửi: ${row.email}`);
    } catch (err) {
      entry.status = 'unknown'; entry.error = err.message;
      console.log(`Dừng tại ${row.email}: ${err.message} Không tự gửi lại để tránh trùng.`);
      break;
    } finally { fs.writeFileSync(journalFile, JSON.stringify(history, null, 2)); }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log(`Lịch sử: ${journalFile}`);
}
module.exports = { generate, params, validate, preview, runFormMode, FIELDS, ACTIONS };
