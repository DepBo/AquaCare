const HOMEPAGE_MARKDOWN = `# AquaCare – Hệ thống IoT Giám sát & Nuôi Cá Cảnh Thông Minh

> AquaCare là nền tảng IoT và ứng dụng Web/Mobile giúp người nuôi cá cảnh nước ngọt theo dõi chất lượng nước (Nhiệt độ, pH, TDS, Mực nước) theo thời gian thực, nhận cảnh báo vượt ngưỡng theo từng loài cá và điều khiển/hẹn giờ thiết bị hồ cá (Máy bơm, Sục oxy, Đèn) từ xa.

## When to use this (Khi nào nên sử dụng AquaCare)

- **Best-fit use cases:** Giám sát tự động bể cá cảnh nước ngọt (Cá Koi, Cá Rồng, Cá Đĩa, Betta, Guppy); cảnh báo vượt ngưỡng pH/nhiệt độ/TDS/mực nước qua Web Push, App Android & Email; điều khiển và hẹn giờ máy bơm, sục oxy, đèn từ xa; trải nghiệm thử nghiệm ảo với gói V3 Demo Simulator 0đ.
- **How to interact:** Truy cập https://aquacare.id.vn/ (HTML/Markdown), xem tài liệu đầy đủ tại https://aquacare.id.vn/llms.txt, đăng ký tại https://aquacare.id.vn/signup, đặt thiết bị hoặc gói V3 Demo 0đ tại https://aquacare.id.vn/cart.

## Liên kết chính thức (Official Links)

- Trang chủ: https://aquacare.id.vn/
- Tài liệu LLMs đầy đủ: https://aquacare.id.vn/llms.txt
- Sitemap: https://aquacare.id.vn/sitemap.xml
- Đăng nhập: https://aquacare.id.vn/login
- Đăng ký: https://aquacare.id.vn/signup
- Giỏ hàng & V3 Demo 0đ: https://aquacare.id.vn/cart
- GitHub: https://github.com/DepBo/AquaCare
`;

export default function middleware(request) {
  const accept = (request.headers.get('accept') || '').toLowerCase();
  const url = new URL(request.url);

  if (accept.includes('text/markdown') && (url.pathname === '/' || url.pathname === '/index.html')) {
    return new Response(HOMEPAGE_MARKDOWN, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  }
}

export const config = {
  matcher: ['/', '/index.html'],
};
