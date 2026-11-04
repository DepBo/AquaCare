const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const dir = path.join(root, 'test-results');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const read = name => {
  const file = path.join(dir, name);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
};
const rows = [];

function addBackend() {
  const xml = read('backend-junit.xml');
  if (!xml) return;
  const decode = value => value.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;|&apos;|&lt;|&gt;|&amp;/g, entity => ({
      '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&amp;': '&',
    })[entity]);
  const attribute = (source, name) => decode(new RegExp(`\\b${name}="([^"]*)"`).exec(source)?.[1] ?? '');
  for (const match of xml.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g)) {
    const body = match[2] ?? '';
    const status = /<failure\b|<error\b/.test(body) ? 'FAIL' : /<skipped\b/.test(body) ? 'SKIP' : 'PASS';
    rows.push({ suite: 'Backend', name: attribute(match[1], 'name'), status,
      seconds: Number(attribute(match[1], 'time')) || 0, evidence: [{ label: 'JUnit XML', href: 'backend-junit.xml' }] });
  }
}

function addPlaywright() {
  const raw = read('playwright.json');
  if (!raw) return;
  const report = JSON.parse(raw);
  const visit = suites => {
    for (const suite of suites ?? []) {
      for (const spec of suite.specs ?? []) {
        const tests = spec.tests ?? [];
        const runs = tests.flatMap(test => test.results ?? []);
        const finalStatuses = tests.map(test => test.results?.at(-1)?.status ?? test.status);
        const status = finalStatuses.length === 0 ? 'SKIP'
          : finalStatuses.every(value => value === 'passed' || value === 'expected') ? 'PASS'
          : finalStatuses.every(value => value === 'skipped') ? 'SKIP' : 'FAIL';
        const id = /^\[([A-Z]+-\d+)\]/.exec(spec.title)?.[1];
        const evidence = [{ label: 'Playwright', href: 'playwright-html/index.html' }];
        if (id) {
          const evidenceDir = path.join(dir, 'evidence', id);
          if (fs.existsSync(evidenceDir)) {
            for (const file of fs.readdirSync(evidenceDir).filter(file => /\.(png|jpe?g)$/i.test(file))) {
              evidence.push({ label: file, href: `evidence/${encodeURIComponent(id)}/${encodeURIComponent(file)}` });
            }
          }
        }
        rows.push({ suite: 'Web / Playwright', name: spec.title, status,
          seconds: runs.reduce((sum, run) => sum + (run.duration || 0), 0) / 1000, evidence });
      }
      visit(suite.suites);
    }
  };
  visit(report.suites);
}

function addFlutter(file, suite) {
  const raw = read(file);
  if (!raw) return;
  const starts = new Map();
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const event = JSON.parse(line);
    if (event.type === 'testStart') starts.set(event.test.id, event);
    if (event.type !== 'testDone') continue;
    const start = starts.get(event.testID);
    if (!start || start.test?.metadata?.skip || event.hidden) continue;
    const status = event.skipped ? 'SKIP' : event.result === 'success' ? 'PASS' : 'FAIL';
    rows.push({ suite, name: start.test.name, status,
      seconds: Math.max(0, (event.time - start.time) / 1000),
      evidence: [{ label: 'Flutter JSON', href: file }] });
  }
}

addBackend();
addPlaywright();
addFlutter('flutter-widget.json', 'Flutter widget');
addFlutter('flutter-usb.json', 'Flutter USB');

const suiteRaw = read('suite-results.json');
const suiteResults = suiteRaw ? JSON.parse(suiteRaw) : [];
const suites = Array.isArray(suiteResults) ? suiteResults : [suiteResults];
const counts = { PASS: 0, FAIL: 0, SKIP: 0 };
for (const row of rows) counts[row.status]++;
const bySuite = suites.map(item => `${item.Suite}: ${item.Result}`).join(' · ');
const stamped = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const tableRows = rows.map((row, index) => `<tr data-suite="${escape(row.suite)}" data-status="${row.status}"><td>${index + 1}</td><td>${escape(row.suite)}</td><td>${escape(row.name)}</td><td class="${row.status.toLowerCase()}">${row.status}</td><td>${row.seconds.toFixed(2)}s</td><td>${row.evidence.map(link => `<a href="${escape(link.href)}">${escape(link.label)}</a>`).join(', ')}</td></tr>`).join('\n');
const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AquaCare · Kết quả kiểm thử tổng hợp</title><style>body{font:15px system-ui,sans-serif;margin:32px auto;max-width:1400px;padding:0 18px;color:#123;background:#f4f8fa}h1{margin-bottom:4px}.meta{color:#567}.filters{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0;align-items:center}.filters input,.filters select{padding:10px 12px;border:1px solid #cbd8df;border-radius:8px;background:white;color:#123;font:inherit}.filters input{min-width:280px;flex:1}.scroll{overflow-x:auto;background:#fff;border-radius:12px}table{width:100%;border-collapse:collapse;min-width:900px}th,td{padding:12px;text-align:left;border-bottom:1px solid #dce5e9;vertical-align:top}th{background:#e8f4f3}.pass{color:#07856b;font-weight:700}.fail{color:#bd3434;font-weight:700}.skip{color:#a16a08;font-weight:700}a{color:#087b9a}tr[hidden]{display:none}</style><h1>Kết quả kiểm thử AquaCare</h1><p class="meta">Tạo lúc ${escape(stamped)} · ${rows.length} ca có kết quả · ${counts.PASS} PASS · ${counts.FAIL} FAIL · ${counts.SKIP} SKIP</p><p class="meta">${escape(bySuite || 'Chưa có trạng thái bộ kiểm thử')} · Chỉ tính ca có bản ghi thực tế, không tính toàn bộ kế hoạch kiểm thử.</p><div class="filters"><input id="search" type="search" placeholder="Tìm tên hoặc mã test case" aria-label="Tìm test case"><select id="suite" aria-label="Lọc nhóm"><option value="all">Tất cả nhóm</option><option>Backend</option><option>Web / Playwright</option><option>Flutter widget</option><option>Flutter USB</option></select><select id="status" aria-label="Lọc trạng thái"><option value="all">Tất cả trạng thái</option><option>PASS</option><option>FAIL</option><option>SKIP</option></select><span id="shown" aria-live="polite"></span></div><div class="scroll"><table><thead><tr><th>STT</th><th>Nhóm</th><th>Test case</th><th>Trạng thái</th><th>Thời gian</th><th>Evidence / log</th></tr></thead><tbody>${tableRows}</tbody></table></div><script>const search=document.getElementById('search'),suite=document.getElementById('suite'),status=document.getElementById('status'),shown=document.getElementById('shown'),rows=[...document.querySelectorAll('tbody tr')];function filter(){const query=search.value.toLocaleLowerCase('vi').trim();let count=0;for(const row of rows){const visible=(suite.value==='all'||row.dataset.suite===suite.value)&&(status.value==='all'||row.dataset.status===status.value)&&row.cells[2].textContent.toLocaleLowerCase('vi').includes(query);row.hidden=!visible;if(visible)count++}shown.textContent='Hiển thị '+count+'/'+rows.length+' ca'}search.addEventListener('input',filter);suite.addEventListener('change',filter);status.addEventListener('change',filter);filter()</script></html>`;
fs.writeFileSync(path.join(dir, 'core-results.html'), html);
console.log(`Combined case report: ${path.join(dir, 'core-results.html')} (${rows.length} cases)`);
