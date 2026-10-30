const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const resultsDir = path.join(root, 'test-results');
const matrixPath = path.join(resultsDir, 'case-matrix.md');
const latestPath = path.join(resultsDir, 'latest.md');
const outputPath = path.join(resultsDir, 'case-report.html');

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const read = file => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const matrix = read(matrixPath);
if (!matrix) throw new Error(`Missing case matrix: ${matrixPath}`);

const descriptions = new Map();
for (const name of ['AQUACARE_SYSTEM_TEST_CASES.md', 'AQUACARE_TEST_CASES_ADDENDUM_2026-10-28.md']) {
  const source = read(path.join(root, 'docs', 'testing', name));
  for (const line of source.split(/\r?\n/)) {
    const match = /^\|\s*([A-Z]+-\d+)\s*\|(.+)\|$/.exec(line);
    if (!match) continue;
    const columns = match[2].split('|').map(value => value.trim());
    descriptions.set(match[1], columns[1] || '');
  }
}

const cases = [];
for (const line of matrix.split(/\r?\n/)) {
  const match = /^\|\s*([A-Z]+-\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|/.exec(line);
  if (!match) continue;
  const [, id, source, status] = match;
  const evidenceDir = path.join(resultsDir, 'evidence', id);
  const evidence = fs.existsSync(evidenceDir)
    ? fs.readdirSync(evidenceDir).filter(name => /\.(png|jpe?g|json|txt|md)$/i.test(name)).sort()
    : [];
  cases.push({ id, source: source.trim(), status: status.trim(), description: descriptions.get(id) || '', evidence });
}

const counts = Object.fromEntries(['PASS', 'FAIL', 'PARTIAL PASS', 'NOT RUN IN FULL'].map(status => [status, cases.filter(item => item.status === status).length]));
const latest = read(latestPath);
const runAt = /Run:\s*([^\r\n]+)/.exec(latest)?.[1] || 'Chưa có thời gian chạy';
const suiteRows = [...latest.matchAll(/^\|\s*(Backend unit and safety tests|Flutter mobile widget tests|Playwright web desktop and phone smoke tests)\s*\|\s*(PASS|FAIL|STOPPED)\s*\|\s*([^|]+)\|/gm)]
  .map(([, name, status, seconds]) => `<span><b>${escapeHtml(name)}</b>: <strong class="${status.toLowerCase()}">${escapeHtml(status)}</strong> · ${escapeHtml(seconds.trim())} giây</span>`).join('');
const labels = { PASS: '✓ PASS', FAIL: '✕ FAIL', 'PARTIAL PASS': '◐ PARTIAL PASS', 'NOT RUN IN FULL': '— CHƯA CHẠY ĐỦ' };
const classFor = { PASS: 'pass', FAIL: 'fail', 'PARTIAL PASS': 'partial', 'NOT RUN IN FULL': 'not-run' };
const rows = cases.map(item => {
  const links = item.evidence.length
    ? item.evidence.map(name => `<a href="evidence/${encodeURIComponent(item.id)}/${encodeURIComponent(name)}" target="_blank" rel="noopener">${escapeHtml(name)}</a>`).join('')
    : '<span class="muted">Chưa có</span>';
  return `<tr data-status="${escapeHtml(item.status)}" data-search="${escapeHtml(`${item.id} ${item.description} ${item.source}`.toLowerCase())}"><td class="id">${escapeHtml(item.id)}</td><td>${escapeHtml(item.description)}</td><td><span class="badge ${classFor[item.status] || 'not-run'}">${labels[item.status] || escapeHtml(item.status)}</span></td><td class="links">${links}</td></tr>`;
}).join('\n');

const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AquaCare · Kết quả kiểm thử</title>
<style>
:root{font-family:Inter,Segoe UI,Arial,sans-serif;color:#142a36;background:#f4f8fa}*{box-sizing:border-box}body{margin:0;padding:32px}main{max-width:1440px;margin:auto}h1{margin:0 0 8px;font-size:30px}.sub{color:#526b78;margin:0 0 24px}.summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:20px}.card{background:white;border:1px solid #dce8eb;border-radius:16px;padding:16px}.card b{display:block;font-size:28px;margin-top:6px}.card span{font-size:13px;color:#526b78}.card.pass b{color:#078b68}.card.fail b{color:#c03843}.card.partial b{color:#a76b12}.suite{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 20px}.suite span{background:white;border:1px solid #dce8eb;border-radius:10px;padding:10px 12px;font-size:13px}.suite .pass{color:#078b68}.suite .fail{color:#c03843}.controls{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}input,select{font:inherit;border:1px solid #bfd2d9;background:white;border-radius:10px;padding:10px 12px}input{min-width:270px;flex:1}.table-wrap{overflow:auto;background:white;border:1px solid #dce8eb;border-radius:16px}table{border-collapse:collapse;width:100%;min-width:800px}th,td{text-align:left;border-bottom:1px solid #e7eef0;padding:12px 14px;vertical-align:top}th{position:sticky;top:0;background:#eaf4f5;font-size:13px}td{font-size:14px}.id{font-weight:750;white-space:nowrap}.badge{display:inline-block;white-space:nowrap;border-radius:999px;font-size:12px;font-weight:750;padding:6px 9px}.badge.pass{background:#d9f4e9;color:#076e51}.badge.fail{background:#ffe5e7;color:#a32632}.badge.partial{background:#fff0ce;color:#85550c}.badge.not-run{background:#edf1f4;color:#607480}.links{min-width:215px}.links a{display:block;color:#087c91;text-decoration:none;margin-bottom:4px;overflow-wrap:anywhere}.links a:hover{text-decoration:underline}.muted{color:#82949d}.note{font-size:13px;color:#526b78;margin:18px 0}@media(max-width:700px){body{padding:16px}h1{font-size:24px}.summary{grid-template-columns:repeat(2,1fr)}}
</style></head><body><main><h1>AquaCare · Kết quả kiểm thử</h1><p class="sub">Lần chạy: ${escapeHtml(runAt)} · Dữ liệu từ môi trường test cô lập</p>
<section class="summary"><div class="card"><span>Tổng ca hệ thống</span><b>${cases.length}</b></div><div class="card pass"><span>✓ PASS</span><b>${counts.PASS}</b></div><div class="card fail"><span>✕ FAIL</span><b>${counts.FAIL}</b></div><div class="card partial"><span>◐ Một phần</span><b>${counts['PARTIAL PASS']}</b></div><div class="card"><span>Chưa chạy đầy đủ</span><b>${counts['NOT RUN IN FULL']}</b></div></section>
<div class="suite">${suiteRows}</div><div class="controls"><input id="search" type="search" placeholder="Tìm mã hoặc nội dung ca test…" aria-label="Tìm ca test"><select id="status" aria-label="Lọc trạng thái"><option value="">Tất cả trạng thái</option><option>PASS</option><option>FAIL</option><option>PARTIAL PASS</option><option>NOT RUN IN FULL</option></select></div>
<div class="table-wrap"><table><thead><tr><th>Mã ca</th><th>Nội dung kiểm thử</th><th>Kết quả</th><th>Evidence</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="note">PASS/FAIL chỉ áp dụng cho ca đã chạy đầy đủ. Evidence là ảnh hoặc dữ liệu ghi lại trong từng ca; ca chưa chạy không có kết quả giả. <a href="playwright-html/index.html">Xem báo cáo Playwright chi tiết</a>.</p>
</main><script>const search=document.getElementById('search'),status=document.getElementById('status');function filter(){const q=search.value.toLowerCase().trim(),s=status.value;for(const row of document.querySelectorAll('tbody tr'))row.hidden=!!((s&&row.dataset.status!==s)||(q&&!row.dataset.search.includes(q)))}search.addEventListener('input',filter);status.addEventListener('change',filter)</script></body></html>`;
fs.writeFileSync(outputPath, html, 'utf8');
console.log(`Case report: ${outputPath} (${cases.length} cases)`);
