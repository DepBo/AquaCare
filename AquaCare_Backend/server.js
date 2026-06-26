require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares – CORS phải được khai báo ĐẦU TIÊN, trước mọi route
const allowedOrigins = [
  'http://localhost:5173',          // Dev local (Vite default)
  'http://localhost:3000',          // Dev local (alt port)
  'https://aquacare-p78r.onrender.com', // Backend Render (self)
  /\.vercel\.app$/,                 // Mọi subdomain Vercel
  /\.netlify\.app$/,                // Mọi subdomain Netlify
  /\.github\.io$/,                  // GitHub Pages
];

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép request không có origin (Postman, curl, mobile app)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204, // Fix cho IE11 / một số browser cũ
}));

// Xử lý preflight OPTIONS cho tất cả routes (tương thích Express 5 / Node 24+)
app.options('/{*path}', cors());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Bắt các route không tồn tại
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Khởi chạy Bộ quét hẹn giờ ngầm cùng lúc với Server
try {
  require('./timer_worker.js');
  console.log('✅ Đã tích hợp Timer Worker chạy nền thành công!');
} catch (err) {
  console.error('❌ Lỗi khi khởi chạy Timer Worker:', err);
}
