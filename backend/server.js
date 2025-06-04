const express = require('express');
const cors = require('cors');
require('dotenv').config();
const movieRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware'); // 导入认证中间件

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  // 明确指定允许的源，而不是使用通配符
  origin: 'http://localhost:3000',
  // 允许凭据
  credentials: true,
  // 允许的HTTP方法
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // 允许的请求头
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ 
  limit: '2mb',
  verify: (req, res, buf) => {
    try {
      if (buf.length) {
        JSON.parse(buf);
      }
    } catch (e) {
      console.error(`JSON解析错误(${req.url}):`, e.message);
      // 不抛出错误，让请求继续处理
    }
  }
})); 
app.use(express.urlencoded({ extended: true }));

// 添加请求日志中间件，特别是对注册请求
app.use((req, res, next) => {
  if (req.path.includes('/auth/register')) {
    console.log('-----------------------------------------------------');
    console.log('[注册请求] 请求路径:', req.path);
    console.log('[注册请求] Content-Type:', req.headers['content-type']);
    console.log('[注册请求] 请求体:', req.body);
    console.log('-----------------------------------------------------');
  }
  next();
});

// 添加更精确的错误处理中间件
app.use((err, req, res, next) => {
  console.error('Express错误:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      success: false, 
      error: '无效的请求格式',
      details: '请求JSON格式不正确'
    });
  }
  next(err);
});

// 添加请求体调试中间件
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path.includes('/auth/')) {
    console.log('------------------------------------');
    console.log(`请求路径: ${req.method} ${req.path}`);
    console.log(`内容类型: ${req.headers['content-type']}`);
    console.log('请求体:', req.body);
    console.log('------------------------------------');
  }
  next();
});

// DEBUGGING: Log raw request body (可以保留或移除)
app.use((req, res, next) => {
  if (req.method === 'POST' && req.url.includes('/login')) {
    // 只记录已解析的请求体，不直接访问原始流
    console.log('-----------------------------------------------------');
    console.log('[REQUEST DEBUG] Path:', req.method, req.url);
    console.log('[REQUEST DEBUG] Headers:', JSON.stringify(req.headers, null, 2));
    console.log('[REQUEST DEBUG] Parsed Body:', req.body);
    console.log('-----------------------------------------------------');
  }
  next();
});

// 全局应用认证中间件 - 它会尝试解析 token 并附加 req.user
// 但它本身不会阻止请求，除非 token 格式非常错误 (例如没有 Bearer)
// 为了更细致的控制，我们让它总是调用 next()
app.use('/api', authMiddleware); // 应用于所有 /api/* 路由

// Log all requests (可选的调试中间件)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - User: ${req.user ? req.user.username : 'Guest'}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Auth 路由 (登录和注册) 通常是白名单
app.use('/api/auth', authRoutes); 

// Movie 路由 - 部分需要认证，部分公开
app.use('/api/movies', movieRoutes); 


// 基本错误处理
app.use((err, req, res, next) => {
  console.error("Unhandled error in Express:", err.stack || err);
  // 如果是 JWT 相关的特定错误，可以特殊处理
  if (err.name === 'UnauthorizedError') { // 例如由 express-jwt 抛出的错误
    return res.status(401).json({ message: err.message });
  }
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
  });
});

app.listen(PORT, () => {
  console.log(`后端服务器运行在 http://localhost:${PORT}`);
  // 确保数据库连接成功
  const db = require('./db'); // 引入 db.js
  db.query('SELECT 1') // 一个简单的查询来测试连接
    .then(() => console.log('成功连接到数据库。'))
    .catch(err => console.error('数据库连接失败:', err));
});