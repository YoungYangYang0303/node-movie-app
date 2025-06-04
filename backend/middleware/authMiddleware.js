const jwt = require('jsonwebtoken');
const db = require('../db'); // 假设您的数据库连接实例在 db.js 中

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1); // 强制退出，因为没有 JWT_SECRET 应用无法安全运行
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 对于需要认证的接口，如果没有提供 token，则返回 401
    // 对于白名单接口，这个中间件可能不应该直接拒绝，而是由路由自身决定是否需要认证
    // 我们稍后会在 server.js 中更灵活地应用这个中间件
    // console.log('[AuthMiddleware] No token provided or malformed header');
    // return res.status(401).json({ message: '未授权：需要提供有效的Token' });
    // 暂时先让它通过，如果路由需要认证而没有 req.user，则路由会失败或自行处理
    return next(); 
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    // console.log('[AuthMiddleware] Token not found after Bearer');
    // return res.status(401).json({ message: '未授权：Token格式不正确' });
    return next(); // 同上，暂时通过
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log('[AuthMiddleware] Token decoded:', decoded);

    // 可选：从数据库验证用户是否存在或状态是否有效
    // 这可以防止已删除或已禁用的用户使用旧的有效 token
    const [rows] = await db.query('SELECT user_id, username FROM users WHERE user_id = ?', [decoded.userId]);
    if (rows.length === 0) {
      console.log('[AuthMiddleware] User from token not found in DB. Token UserID:', decoded.userId);
      // 即使用户在DB中不存在，也不立即返回401，让路由决定。
      // 或者，如果严格要求，可以返回401
      // return res.status(401).json({ message: '未授权：用户不存在或Token无效' });
      return next(); // 暂时通过
    }
    
    // 将解码后的用户信息（或从数据库获取的更完整的用户信息）附加到请求对象
    req.user = { 
        user_id: rows[0].user_id, 
        username: rows[0].username 
        // 你可以根据需要添加更多信息，例如角色等
    }; 
    // console.log('[AuthMiddleware] User attached to request:', req.user);
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Invalid token:', error.message);
    // 如果 token 验证失败 (例如过期、签名不匹配)
    // 对于需要认证的接口，这里应该返回 401
    // 对于白名单接口，这个错误不应该阻止访问
    // 我们将在 server.js 中处理哪些路由需要强制认证
    // 清除 req.user 以防部分解码的信息残留
    req.user = null; 
    if (error.name === 'TokenExpiredError') {
        // 可以选择在 res 上附加一个标记，让前端知道是 token 过期
        // res.locals.tokenExpired = true; 
        // 或者直接在 apiService.js 中处理基于 401 的特定逻辑
    }
    next(); // 即使 token 无效，也调用 next()，让路由决定是否需要有效的 req.user
  }
};

module.exports = authMiddleware;