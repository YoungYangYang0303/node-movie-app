"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/AuthForm.module.css';

export default function AuthForm({ mode, onSubmit, loading, serverError }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // 新增确认密码状态
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(''); // 每次提交前清空之前的客户端错误

    if (!username || !password) {
      setFormError('用户名和密码不能为空');
      return;
    }
    if (password.length < 6) {
      setFormError('密码长度至少为6位');
      return;
    }
    // 如果是注册模式，则校验确认密码
    if (mode === 'register' && password !== confirmPassword) {
      setFormError('两次输入的密码不匹配');
      return;
    }
    onSubmit({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h2>{mode === 'login' ? '登录' : '注册'}</h2>
      {/* 服务器错误优先显示 */}
      {serverError && <p className={styles.errorText}>{serverError}</p>}
      {/* 如果没有服务器错误，再显示客户端表单错误 */}
      {!serverError && formError && <p className={styles.errorText}>{formError}</p>}
      
      <div className={styles.inputGroup}>
        <label htmlFor="username">用户名</label>
        <input
          type="text"
          id="username"
          name="username" // 建议添加 name 属性，虽然这里用 state 控制
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={styles.inputField}
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="password">密码</label>
        <input
          type="password"
          id="password"
          name="password" // 建议添加 name 属性
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
          className={styles.inputField}
        />
      </div>

      {/* 仅在注册模式下显示确认密码字段 */}
      {mode === 'register' && (
        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required={mode === 'register'} // 仅在注册时必填
            className={styles.inputField}
          />
        </div>
      )}
      
      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
      </button>

      <div className={styles.switchForm}>
        {mode === 'login' ? (
          <p>
            还没有账户? <Link href="/register">点此注册</Link>
          </p>
        ) : (
          <p>
            已有账户? <Link href="/login">立即登录</Link>
          </p>
        )}
      </div>
    </form>
  );
}