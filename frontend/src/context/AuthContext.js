"use client";
import { createContext, useState, useEffect, useContext } from 'react'; // 确保 useContext 已导入
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/services/apiService'; // 导入 apiRequest
import { API_ENDPOINTS } from '@/config/apiConfig'; // 导入 API_ENDPOINTS
import { registerUser as authRegisterUser } from '@/services/authService'; // 添加这一行

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // 添加加载状态
  const router = useRouter();

  useEffect(() => {
    // 尝试从 localStorage 加载 token 和 user
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // 验证 parsedUser 是否包含 user_id
        if (parsedUser && typeof parsedUser.user_id !== 'undefined') {
          setToken(storedToken);
          setUser(parsedUser);
          console.log('[AuthContext] User restored from localStorage:', parsedUser);
        } else {
          console.warn('[AuthContext] User from localStorage missing user_id, clearing.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error('[AuthContext] Failed to parse user from localStorage', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false); // 完成初始加载
  }, []);

  const login = async (credentials) => {
    setLoading(true); // 开始加载
    // setError(null); // 清除之前的错误，如果 AuthContext 管理错误状态的话
    try {
      console.log('[AuthContext] login function received:', credentials);
      const responseData = await apiRequest(API_ENDPOINTS.LOGIN, 'POST', credentials);
      
      if (responseData && responseData.token && responseData.user && typeof responseData.user.user_id !== 'undefined') {
        setToken(responseData.token);
        setUser(responseData.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', responseData.token);
          localStorage.setItem('user', JSON.stringify(responseData.user));
        }
        console.log('[AuthContext] User logged in:', responseData.user);
        // setError(null); // 登录成功，清除错误
      } else {
        // apiRequest 应该已经处理了错误并抛出，这里可能不需要再次抛出
        // 但如果 apiRequest 返回了非预期的数据结构，可以在这里处理
        console.error('[AuthContext] Login response data structure incorrect:', responseData);
        throw new Error(responseData?.error || responseData?.message || "登录失败或返回数据格式不正确");
      }
    } catch (err) {
      console.error('[AuthContext] Login failed:', err);
      // setError(err.message); // 设置错误状态供UI显示
      throw err; // 重新抛出错误，让调用者 (LoginPage) 也能捕获
    } finally {
      setLoading(false); // 完成加载
    }
  };

  // 修改register函数，确保正确处理表单数据

  const register = async (credentials) => {
    setLoading(true);
    try {
      console.log('[AuthContext] register function received:', credentials);
      
      // 确保credentials是一个包含username和password的对象
      if (typeof credentials === 'string') {
        // 如果直接传递了字符串，转换为对象
        credentials = { username: credentials };
      }
      
      // 确保必要字段存在
      if (!credentials.username) {
        throw new Error('用户名不能为空');
      }
      
      if (!credentials.password) {
        throw new Error('密码不能为空');
      }
      
      // 使用authService中的registerUser函数
      const responseData = await authRegisterUser(credentials);
      
      console.log('[AuthContext] User registered:', responseData);
      
      if (responseData.success === false || responseData.error) {
        throw new Error(responseData.error || "注册失败");
      }
      
      return { success: true, message: "注册成功" };
    } catch (err) {
      console.error('[AuthContext] Registration failed:', err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login'); // 或者首页
    console.log('[AuthContext] User logged out');
  };

  const handleSessionExpired = () => {
    console.warn('[AuthContext] Session expired or invalid, logging out.');
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    // 可选：传递当前路径，以便登录后重定向回来
    // const currentPath = window.location.pathname + window.location.search;
    // router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    router.push('/login?session_expired=true'); // 添加一个查询参数以显示消息
  };

  // 在 login, register 或其他调用 apiRequest 的地方的 catch 块中：
  // catch (err) {
  //   console.error('[AuthContext] API request failed:', err);
  //   if (err.message && (err.message.includes('过期') || err.message.includes('未授权') || err.message.includes('无效'))) {
  //     handleSessionExpired(); // 如果错误消息表明是认证问题，则调用
  //   }
  //   // setError(err.message); 
  //   throw err; 
  // }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, register, loading, handleSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) { // 检查 context 是否未定义或为 null
    throw new Error('useAuth must be used within an AuthProvider'); // 抛出错误提示
  }
  return context; // 返回 context
};