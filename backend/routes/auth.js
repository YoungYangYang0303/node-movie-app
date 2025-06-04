const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // 导入 authController

// 用户注册
// POST /api/auth/register
router.post('/register', authController.registerUser);

// 用户登录
// POST /api/auth/login
router.post('/login', authController.loginUser);

module.exports = router;