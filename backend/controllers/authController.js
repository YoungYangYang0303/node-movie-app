const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// 用户注册逻辑
exports.registerUser = async (req, res) => {
  console.log('--- [Auth Register Controller] ---');
  console.log('[Auth Register Controller] req.body:', req.body);
  
  try {
    // 防御性编程: 检查req.body是否存在并是一个对象
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        success: false,
        error: '无效的请求数据格式' 
      });
    }
    
    const { username, password, email } = req.body;

    // 验证必填字段
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: '用户名不能为空' 
      });
    }
    
    if (!password) {
      return res.status(400).json({ 
        success: false,
        error: '密码不能为空' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: '密码长度不能少于6位' 
      });
    }

    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        success: false,
        error: '用户名已存在' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let query;
    let params;
    
    if (email && email.trim() !== '') {
      query = `INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)`;
      params = [username, hashedPassword, email];
    } else {
      query = `INSERT INTO users (username, password_hash) VALUES (?, ?)`;
      params = [username, hashedPassword];
    }
    
    console.log('[DEBUG] 执行注册查询:', query);
    console.log('[DEBUG] 参数:', params.map((p, i) => i === 1 ? '***' : p));
    
    const [result] = await db.query(query, params);
    
    res.status(201).json({ 
      success: true,
      message: '用户注册成功', 
      userId: result.insertId 
    });
  } catch (err) {
    console.error("注册错误:", err);
    res.status(500).json({ 
      success: false,
      error: '服务器内部错误', 
      details: err.message 
    });
  }
};

// 用户登录逻辑
exports.loginUser = async (req, res) => {
  console.log('--- [Auth Login Controller] ---');
  console.log('[Auth Login Controller] req.body:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  try {
    // 先检查用户表结构，确认字段名
    const [columns] = await db.query('SHOW COLUMNS FROM users');
    console.log('[DEBUG] 用户表结构:', columns.map(c => c.Field));

    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: '无效的用户名或密码' });
    }

    const user = users[0];
    
    // 改进的密码字段检测逻辑
    let passwordField = null;
    let passwordHash = null;
    
    // 检查所有可能的密码字段
    if (user.password_hash != null) {
      passwordField = 'password_hash';
      passwordHash = user.password_hash;
    } else if (user.password != null) {
      passwordField = 'password';
      passwordHash = user.password;
    }
    
    console.log(`[DEBUG] 密码字段检测: 字段名=${passwordField}, 哈希值存在=${!!passwordHash}`);
    
    // 确保找到可用的密码哈希
    if (!passwordHash) {
      console.error('用户记录中没有有效的密码哈希值:', username);
      return res.status(401).json({ error: '账户配置错误，请联系管理员' });
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: '无效的用户名或密码' });
    }

    const token = jwt.sign({ userId: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    
    const userForFrontend = {
        user_id: user.user_id,
        username: user.username,
    };

    res.json({ 
        message: '登录成功', 
        token,
        user: userForFrontend
    });

  } catch (err) {
    console.error("登录错误:", err);
    res.status(500).json({ error: '服务器内部错误', details: err.message });
  }
};