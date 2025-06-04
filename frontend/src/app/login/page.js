"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import styles from '@/styles/AuthForm.module.css'; // 假设您仍希望使用这个样式文件

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading, error: serverAuthError, setError: setServerAuthError } = useAuth();

  useEffect(() => {
    if (user) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
  }, [user, router, searchParams]);

  const handleLogin = async (credentials) => { // credentials is { username, password } from AuthForm
    if (setServerAuthError) setServerAuthError(null);
    try {
      // 修改这里：直接传递 credentials 对象
      await login(credentials); 
    } catch (err) {
      // err.message 已经是 AuthContext 中抛出的错误信息了
      // 如果 AuthContext 没有捕获并重新抛出特定消息，这里可能是通用错误
      console.error("Login page caught error from AuthContext:", err.message);
      // 你可能还想在这里通过 setServerAuthError(err.message) 来显示错误给用户
      if (setServerAuthError) {
        setServerAuthError(err.message || "登录时发生未知错误");
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        loading={loading}
        serverError={serverAuthError}
        // title="登录" // 标题可以由 AuthForm 内部根据 mode 决定
      />
    </div>
  );
}