"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import styles from '@/styles/AuthForm.module.css'; // 假设您仍希望使用这个样式文件

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error: serverAuthError, setError: setServerAuthError, user } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/'); // 如果已登录，跳转到首页
    }
  }, [user, router]);

  // 示例：如何正确调用register函数
  const handleRegister = async (formData) => {
    // 确保formData包含用户名和密码
    const userData = {
      username: formData.username, // 确保这个字段名正确
      password: formData.password, // 确保这个字段名正确
      email: formData.email // 可选
    };
    
    console.log("表单数据:", userData);
    
    const result = await register(userData);
    if (result.success) {
      setSuccessMessage(result.message || '注册成功！即将跳转到登录页面...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
    // serverAuthError 会由 AuthContext 设置
  };

  return (
    <div className={styles.authContainer}>
      {successMessage && <p className={styles.successText}>{successMessage}</p>}
      <AuthForm
        mode="register"
        onSubmit={handleRegister}
        loading={loading}
        serverError={serverAuthError}
        // title="创建账户" // 标题可以由 AuthForm 内部根据 mode 决定
      />
    </div>
  );
}