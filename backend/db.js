const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('成功连接到数据库。');
    connection.release();
  })
  .catch(err => {
    console.error('数据库连接错误:', err.stack);
    process.exit(1); // 如果数据库连接失败则退出
  });

module.exports = pool;