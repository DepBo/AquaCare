import { readFile, writeFile } from 'node:fs/promises'

// Vercel serves dist/404.html with HTTP 404 for paths outside the SPA rewrites.
// The same React route then renders the branded 404 page after JS loads.
const index = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const fallback = '<main style="min-height:100vh;display:grid;place-items:center;background:#f1fcf7;color:#06253d;font:16px Inter,sans-serif;text-align:center;padding:24px"><div><img src="/logo_ngang.png" alt="AquaCare" style="width:220px;max-width:80%;margin-bottom:40px"><h1>Ối! Bạn đã bơi lạc rồi.</h1><p>Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p><a href="/" style="color:#0d8d8d">Về trang chủ</a></div></main>'

if (!index.includes('<div id="root"></div>')) {
  throw new Error('Không tìm thấy #root trong dist/index.html')
}

await writeFile(
  new URL('../dist/404.html', import.meta.url),
  index.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`)
    .replace(/<title>[^<]*<\/title>/, '<title>404 · Không tìm thấy trang | AquaCare</title>'),
)
