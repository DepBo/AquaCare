import { mkdir, readFile, writeFile } from 'node:fs/promises'

// Vercel serves dist/404.html with HTTP 404 for paths outside the SPA rewrites.
// The same React route then renders the branded 404 page after JS loads.
const index = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const rootPattern = /<div id="root">[\s\S]*?<\/div>\s*(?=<\/body>|<script)/

if (!rootPattern.test(index)) {
  throw new Error('Không tìm thấy #root trong dist/index.html')
}

const renderShell = (title, bodyHtml) =>
  index
    .replace(rootPattern, `<div id="root">${bodyHtml}</div>\n    `)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)

const fallback404 = '<main style="min-height:100vh;display:grid;place-items:center;background:#f1fcf7;color:#06253d;font:16px Inter,sans-serif;text-align:center;padding:24px"><div><img src="/logo_ngang.png" alt="AquaCare" style="width:220px;max-width:80%;margin-bottom:40px"><h1>Ối! Bạn đã bơi lạc rồi (404 Not Found).</h1><p>Trang bạn tìm trên AquaCare không tồn tại hoặc đã được di chuyển.</p><p><a href="/" style="color:#0d8d8d;margin-right:12px">Về trang chủ</a><a href="/llms.txt" style="color:#0d8d8d;margin-right:12px">Tài liệu llms.txt</a><a href="/sitemap.xml" style="color:#0d8d8d">Sitemap</a></p></div></main>'

await writeFile(
  new URL('../dist/404.html', import.meta.url),
  renderShell('404 · Không tìm thấy trang | AquaCare', fallback404),
)

const innerRoutes = [
  {
    dir: 'login',
    title: 'Đăng nhập hệ thống | AquaCare IoT',
    html: '<main style="background:#0a1628;color:#e2e8f0;font-family:Inter,sans-serif;padding:32px 20px;line-height:1.6"><h1>Đăng nhập hệ thống giám sát bể cá AquaCare</h1><p>Đăng nhập bằng Email, Số điện thoại hoặc tài khoản Google để truy cập bảng điều khiển theo dõi chỉ số nước (Nhiệt độ, pH, TDS, Mực nước), nhận cảnh báo và điều khiển thiết bị bể cá từ xa.</p><p><a href="/" style="color:#00e5a0;margin-right:16px">Về trang chủ</a><a href="/signup" style="color:#00e5a0;margin-right:16px">Đăng ký tài khoản mới</a><a href="/llms.txt" style="color:#00e5a0">Tài liệu llms.txt</a></p></main>',
  },
  {
    dir: 'signup',
    title: 'Đăng ký tài khoản | AquaCare IoT',
    html: '<main style="background:#0a1628;color:#e2e8f0;font-family:Inter,sans-serif;padding:32px 20px;line-height:1.6"><h1>Đăng ký tài khoản AquaCare IoT</h1><p>Tạo tài khoản AquaCare miễn phí để trải nghiệm bộ thiết bị mô phỏng V3 Demo Simulator 0đ hoặc liên kết thiết bị phần cứng AquaCare giám sát hồ cá cảnh 24/7.</p><p><a href="/" style="color:#00e5a0;margin-right:16px">Về trang chủ</a><a href="/login" style="color:#00e5a0;margin-right:16px">Đăng nhập</a><a href="/llms.txt" style="color:#00e5a0">Tài liệu llms.txt</a></p></main>',
  },
  {
    dir: 'cart',
    title: 'Giỏ hàng & Dùng thử V3 Demo 0đ | AquaCare IoT',
    html: '<main style="background:#0a1628;color:#e2e8f0;font-family:Inter,sans-serif;padding:32px 20px;line-height:1.6"><h1>Giỏ hàng &amp; Đặt bộ thiết bị AquaCare IoT</h1><p>Xem giỏ hàng, đặt mua thiết bị phần cứng AquaCare (Basic V1, Standard V2, Advanced V3) hoặc đăng ký nhận mã MAC dùng thử miễn phí gói AquaCare V3 Demo Simulator 0đ.</p><p><a href="/" style="color:#00e5a0;margin-right:16px">Về trang chủ</a><a href="/login" style="color:#00e5a0;margin-right:16px">Đăng nhập</a><a href="/llms.txt" style="color:#00e5a0">Tài liệu llms.txt</a></p></main>',
  },
]

for (const route of innerRoutes) {
  const dirUrl = new URL(`../dist/${route.dir}`, import.meta.url)
  await mkdir(dirUrl, { recursive: true })
  await writeFile(
    new URL(`../dist/${route.dir}/index.html`, import.meta.url),
    renderShell(route.title, route.html),
  )
}
