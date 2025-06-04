const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// 修改registerUser函数修复URL路径
export const registerUser = async (userData) => {
  // 更详细的日志
  console.log('[authService] registerUser called with:', userData);
  console.log('[authService] userData.username:', userData.username);
  console.log('[authService] userData.password:', userData.password ? '******' : undefined);
  console.log('[authService] userData.email:', userData.email);
  
  const requestBody = {
    username: userData.username,
    password: userData.password,
    email: userData.email || ''
  };
  
  console.log('[authService] Sending request body:', {...requestBody, password: '******'});
  
  try {
    // 直接使用完整URL避免任何路径问题
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // 添加Accept头
      },
      body: JSON.stringify(requestBody),
    });
    
    // 记录响应信息以便调试
    console.log('[authService] Register response status:', response.status);
    
    // 检查响应类型
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      console.log('[authService] Register response data:', data);
      return data;
    } else {
      console.error('[authService] Non-JSON response received');
      return { 
        success: false,
        error: `服务器返回了非JSON格式响应，状态码: ${response.status}` 
      };
    }
  } catch (error) {
    console.error('[authService] Register request error:', error);
    return { 
      success: false,
      error: error.message || '请求失败，请检查网络连接' 
    };
  }
};

// 同样修改登录请求
export const loginUser = async (userData) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};