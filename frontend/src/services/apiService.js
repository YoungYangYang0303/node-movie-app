import { API_ENDPOINTS } from '@/config/apiConfig'; // 导入 API 端点

// 这个函数可以从 AuthContext 获取 token，或者直接从 localStorage
// 为了简化，我们先假设 token 可以从 localStorage 获取
// 更好的做法是在调用此函数时传入 token，或者让此函数能访问 AuthContext
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: `HTTP error ${response.status} and failed to parse error response.` 
    }));
    
    console.error(`API Error ${response.status}:`, errorData);

    // 特别处理 401 未授权错误 (例如 Token 过期或无效)
    if (response.status === 401) {
      // 在这里可以触发全局的登出逻辑，例如通过事件或回调
      // alert('会话已过期或无效，请重新登录。'); // 简单的提示
      // window.location.href = '/login'; // 或者直接跳转到登录页
      // 更优雅的方式是让 AuthContext 处理
      throw new Error(errorData.message || '会话已过期或无效，请重新登录。');
    }
    // 其他错误
    throw new Error(errorData.message || `API请求失败，状态码: ${response.status}`);
  }
  // 对于 204 No Content，response.json() 会报错
  if (response.status === 204) {
    return null; // 或者返回一个表示成功的特定对象 e.g. { success: true }
  }
  return response.json();
}

export async function apiRequest(endpoint, method = 'GET', data = null, customHeaders = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }
  
  // 如果是 GET 请求且有 data，将其转换为查询参数 (可选，通常 GET 的参数直接在 endpoint URL 中)
  // 此处简化，假设 GET 请求的参数已包含在 endpoint URL 中

  console.log(`[apiRequest] Making ${method} request to ${endpoint} with data:`, data, "and headers:", headers);

  const response = await fetch(endpoint, config);
  return handleResponse(response);
}

// 示例：如何使用 apiRequest (这些可以放在各自的 service 文件中，如 movieService.js)
/*
export const getMoviesExample = (searchQuery = '', page = 1, limit = 10) => {
  let url = `${API_ENDPOINTS.MOVIES}?page=${page}&limit=${limit}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }
  return apiRequest(url, 'GET');
};

export const loginUserExample = (credentials) => {
  return apiRequest(API_ENDPOINTS.LOGIN, 'POST', credentials);
};
*/