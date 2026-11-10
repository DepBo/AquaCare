const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const results = path.join(root, 'test-results');
const report = JSON.parse(fs.readFileSync(path.join(results, 'playwright.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const specs = [];
function visit(suites) {
  for (const suite of suites || []) {
    specs.push(...(suite.specs || []));
    visit(suite.suites);
  }
}
visit(report.suites);
const rows = specs.map((spec, index) => {
  const runs = (spec.tests || []).flatMap(test => test.results || []);
  const passed = runs.length > 0 && runs.every(run => run.status === 'passed');
  const seconds = (runs.reduce((sum, run) => sum + (run.duration || 0), 0) / 1000).toFixed(2);
  const id = /^\[([A-Z]+-[A-Z0-9-]+)\]/.exec(spec.title)?.[1];
  const folder = id && path.join(results, 'evidence', id);
  const files = folder && fs.existsSync(folder) ? fs.readdirSync(folder).filter(file => /\.(png|jpg|jpeg)$/i.test(file)) : [];
  const evidence = files.map(file => `<a href="evidence/${encodeURIComponent(id)}/${encodeURIComponent(file)}">${escape(file)}</a>`).join(', ') || '<span>Chi tiết trong Playwright report</span>';
  return `<tr data-status="${passed ? 'pass' : 'fail'}"><td>${index + 1}</td><td>${escape(spec.title)}</td><td class="${passed ? 'pass' : 'fail'}">${passed ? '✓ PASS' : '✕ FAIL'}</td><td>${seconds}s</td><td>${evidence}</td></tr>`;
}).join('\n');
const passed = specs.filter(spec => (spec.tests || []).flatMap(test => test.results || []).every(run => run.status === 'passed')).length;
const started = report.stats?.startTime ? new Date(report.stats.startTime).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AquaCare · Kết quả test web</title><style>body{font:15px system-ui,sans-serif;margin:32px auto;max-width:1200px;padding:0 18px;color:#123;background:#f4f8fa}h1{margin-bottom:4px}p{color:#567}.filters{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0}.filters input,.filters select{padding:10px 12px;border:1px solid #cbd8df;border-radius:8px;background:#fff;color:#123;font:inherit}.filters input{min-width:260px;flex:1}table{width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden}th,td{padding:13px;text-align:left;border-bottom:1px solid #dce5e9}th{background:#e8f4f3}.pass{color:#07856b;font-weight:700}.fail{color:#bd3434;font-weight:700}a{color:#087b9a}</style><h1>Kết quả test web AquaCare</h1><p>Thời gian chạy: ${escape(started)} · ${passed}/${specs.length} PASS · <a href="playwright-html/index.html">Báo cáo Playwright chi tiết</a></p><div class="filters"><input id="search" type="search" placeholder="Tìm mã hoặc tên test case" aria-label="Tìm test case"><select id="status" aria-label="Lọc trạng thái"><option value="all">Tất cả trạng thái</option><option value="pass">PASS</option><option value="fail">FAIL</option></select><span id="shown" aria-live="polite"></span></div><table><thead><tr><th>STT</th><th>Test case</th><th>Trạng thái</th><th>Thời gian</th><th>Evidence</th></tr></thead><tbody>${rows}</tbody></table><script>const search=document.getElementById('search'),status=document.getElementById('status'),shown=document.getElementById('shown'),rows=[...document.querySelectorAll('tbody tr')];function filter(){const query=search.value.toLocaleLowerCase('vi').trim();let count=0;for(const row of rows){const visible=(status.value==='all'||row.dataset.status===status.value)&&row.cells[1].textContent.toLocaleLowerCase('vi').includes(query);row.hidden=!visible;if(visible)count++}shown.textContent='Hiển thị '+count+'/'+rows.length+' ca'}search.addEventListener('input',filter);status.addEventListener('change',filter);filter()</script></html>`;
fs.writeFileSync(path.join(results, 'web-case-results.html'), html);
console.log(`Web case report: ${path.join(results, 'web-case-results.html')} (${specs.length} cases)`);
