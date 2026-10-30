const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const docs = path.join(root, 'docs', 'testing');
const results = path.join(root, 'test-results');
const scopeFile = path.join(docs, 'AQUACARE_PLAYWRIGHT_CASES.md');
const reportFile = path.join(results, 'playwright-scope.html');
const source = fs.readFileSync(path.join(root, 'AquaCare_Web', 'e2e', 'system-cases.spec.ts'), 'utf8');
const ids = [...new Set([...source.matchAll(/test\('\[([A-Z]+-\d+)(:partial)?\]/g)]
  .filter(match => !match[2]).map(match => match[1]))];
const read = file => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const definitions = new Map();
for (const name of ['AQUACARE_SYSTEM_TEST_CASES.md', 'AQUACARE_TEST_CASES_ADDENDUM_2026-10-28.md']) {
  for (const line of read(path.join(docs, name)).split(/\r?\n/)) {
    const match = /^\|\s*([A-Z]+-\d+)\s*\|(.+)\|$/.exec(line);
    if (!match) continue;
    const columns = match[2].split('|').map(value => value.trim());
    definitions.set(match[1], { steps: columns[1] || '', expected: columns[2] || '' });
  }
}

if (process.argv.includes('--write-scope')) {
  const lines = [
    '# AquaCare — phạm vi kiểm thử Playwright', '',
    'Đây là **40 ca có bài Playwright tự động**, được chọn từ bộ kế hoạch 196 ca. Nhiều bài Playwright có thể cùng kiểm tra một ca. File này mô tả phạm vi, không khẳng định các ca đã PASS.',
    '', 'Bộ kế hoạch đầy đủ được giữ ở `AQUACARE_SYSTEM_TEST_CASES.md` và `AQUACARE_TEST_CASES_ADDENDUM_2026-10-28.md`; bản sao ở `archive/`.',
    '', '| Mã ca | Bước kiểm thử | Kết quả cần đạt |', '|---|---|---|',
    ...ids.map(id => {
      const definition = definitions.get(id);
      if (!definition) throw new Error(`Missing definition for ${id}`);
      return `| ${id} | ${definition.steps.replace(/\|/g, '\\|')} | ${definition.expected.replace(/\|/g, '\\|')} |`;
    }), '',
  ];
  fs.writeFileSync(scopeFile, lines.join('\n'), 'utf8');
}

if (!fs.existsSync(scopeFile)) throw new Error('Playwright scope file is missing; run with --write-scope once');
const scopedIds = [...read(scopeFile).matchAll(/^\|\s*([A-Z]+-\d+)\s*\|/gm)].map(match => match[1]);
if (scopedIds.length !== ids.length || scopedIds.some((id, index) => id !== ids[index])) {
  throw new Error('Playwright case scope is out of sync with system-cases.spec.ts');
}

const matrix = new Map();
for (const line of read(path.join(results, 'case-matrix.md')).split(/\r?\n/)) {
  const match = /^\|\s*([A-Z]+-\d+)\s*\|\s*[^|]+\|\s*([^|]+)\|/.exec(line);
  if (match) matrix.set(match[1], match[2].trim());
}
const runAt = /Run:\s*([^\r\n]+)/.exec(read(path.join(results, 'latest.md')))?.[1] || 'Chưa chạy';
const cases = ids.map(id => {
  const evidencePath = path.join(results, 'evidence', id);
  return { id, status: matrix.get(id) || 'NOT RUN IN FULL', definition: definitions.get(id), evidence: fs.existsSync(evidencePath)
    ? fs.readdirSync(evidencePath).filter(name => /\.(png|jpe?g|json|txt|md)$/i.test(name)).sort() : [] };
});
const pass = cases.filter(item => item.status === 'PASS').length;
const fail = cases.filter(item => item.status === 'FAIL').length;
const unfinished = cases.length - pass - fail;
const rows = cases.map(item => {
  const state = item.status === 'PASS' ? '<span class="badge pass">✓ PASS</span>'
    : item.status === 'FAIL' ? '<span class="badge fail">✕ FAIL</span>' : '<span class="badge pending">— CHƯA CÓ KẾT QUẢ ĐẦY ĐỦ</span>';
  const links = item.evidence.length ? item.evidence.map(name => `<a href="evidence/${encodeURIComponent(item.id)}/${encodeURIComponent(name)}" target="_blank">${escape(name)}</a>`).join('') : '—';
  return `<tr><td><b>${escape(item.id)}</b></td><td>${escape(item.definition.steps)}</td><td>${state}</td><td>${links}</td></tr>`;
}).join('\n');
const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AquaCare · Phạm vi Playwright</title>
<style>body{font-family:Inter,Segoe UI,Arial,sans-serif;background:#f4f8fa;color:#17313d;margin:0;padding:28px}main{max-width:1400px;margin:auto}h1{margin:0 0 8px}.muted{color:#607884}.summary{display:flex;gap:12px;flex-wrap:wrap;margin:22px 0}.card{background:white;border:1px solid #dae7eb;border-radius:14px;padding:16px 22px;min-width:145px}.card b{display:block;font-size:28px}.pass{color:#087a59}.fail{color:#b62f3d}.pending{color:#776a3c}.table{background:white;border:1px solid #dae7eb;border-radius:14px;overflow:auto}table{border-collapse:collapse;width:100%;min-width:780px}th,td{text-align:left;padding:12px 14px;border-bottom:1px solid #e6edef;vertical-align:top}th{background:#eaf3f5}.badge{display:inline-block;padding:5px 9px;border-radius:999px;font-size:12px;font-weight:bold;white-space:nowrap}.badge.pass{background:#ddf5e9}.badge.fail{background:#ffe5e8}.badge.pending{background:#fff1cf}td a{display:block;color:#08758a;overflow-wrap:anywhere;margin:0 0 5px}.note{font-size:13px;color:#607884;margin-top:18px}@media(max-width:700px){body{padding:14px}}</style></head>
<body><main><h1>AquaCare · 40 ca kiểm thử Playwright</h1><p class="muted">Phạm vi tự động hóa được chọn từ kế hoạch 196 ca · Lần chạy: ${escape(runAt)}</p>
<section class="summary"><div class="card">Ca trong phạm vi<b>${cases.length}</b></div><div class="card pass">✓ PASS<b>${pass}</b></div><div class="card fail">✕ FAIL<b>${fail}</b></div>${unfinished ? `<div class="card pending">Chưa có kết quả<b>${unfinished}</b></div>` : ''}</section>
<div class="table"><table><thead><tr><th>Mã ca</th><th>Nội dung kiểm thử</th><th>Kết quả</th><th>Evidence</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="note">Báo cáo này chỉ trình bày 40 ca có Playwright. Các ca còn lại trong kế hoạch 196 không thuộc phạm vi báo cáo này. Xem <a href="case-report.html">báo cáo đầy đủ</a> hoặc <a href="playwright-html/index.html">chi tiết 47 bài Playwright</a>.</p></main></body></html>`;
fs.writeFileSync(reportFile, html, 'utf8');
console.log(`Playwright scope report: ${reportFile} (${cases.length} cases, ${pass} PASS, ${fail} FAIL, ${unfinished} without full result)`);
