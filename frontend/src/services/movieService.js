// filepath: c:\Users\Taylor\Desktop\Node.js\04_B230601_杨羽渊_面向对象程序设计Node.js第一阶段代码\frontend\src\services\movieService.js
import { API_ENDPOINTS } from '@/config/apiConfig'; // 导入 API 端点
import { apiRequest } from './apiService'; // 导入封装的请求函数

export const getAllMovies = async (searchQuery = '', page = 1, limit = 10) => {
  let url = `${API_ENDPOINTS.MOVIES}?page=${page}&limit=${limit}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }
  console.log(`[movieService -> getAllMovies] Fetching from: ${url}`);
  // apiRequest 已经处理了 response.ok 和 .json()
  const data = await apiRequest(url, 'GET'); 
  // 确保返回的数据结构与页面期望的一致
  return {
      movies: data.movies || data.data || [], // 兼容后端可能返回 data 字段的情况
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      totalMovies: data.totalMovies,
  };
};

export async function getMovieById(movieId) {
  const url = API_ENDPOINTS.MOVIE_BY_ID(movieId);
  console.log(`[movieService -> getMovieById] Fetching from: ${url}`);
  return apiRequest(url, 'GET');
}

export async function getCommentsByMovieId(movieId) {
  const url = API_ENDPOINTS.MOVIE_COMMENTS(movieId);
  console.log(`[movieService -> getCommentsByMovieId] Fetching from: ${url}`);
  return apiRequest(url, 'GET');
}

export async function addComment(movieId, commentData, token) { // token 参数现在可以移除，apiRequest 会自动处理
  const url = API_ENDPOINTS.MOVIE_COMMENTS(movieId);
  console.log(`[movieService -> addComment] Posting to: ${url}`);
  // apiRequest 会自动从 localStorage (或其内部逻辑) 获取 token
  return apiRequest(url, 'POST', commentData); 
}

export async function favoriteMovie(movieId, token) { // token 参数可以移除
  const url = API_ENDPOINTS.MOVIE_FAVORITE(movieId);
  return apiRequest(url, 'POST');
}

export async function unfavoriteMovie(movieId, token) { // token 参数可以移除
  const url = API_ENDPOINTS.MOVIE_FAVORITE(movieId);
  return apiRequest(url, 'DELETE');
}

export async function checkFavoriteStatus(movieId, token) { // token 参数可以移除
  // 如果 apiRequest 内部的 getToken 无法获取 token (例如用户未登录)
  // 且后端此接口需要认证，则 apiRequest 会自动处理或后端会返回 401
  // 如果此接口允许匿名访问，则不需要 token
  const tokenExists = typeof window !== 'undefined' && localStorage.getItem('token');
  if (!tokenExists) { // 如果用户未登录，则不可能收藏
    return { isFavorite: false };
  }
  const url = API_ENDPOINTS.MOVIE_IS_FAVORITE(movieId);
  return apiRequest(url, 'GET');
}

export async function deleteComment(movieId, commentId, token) { // token 参数可以移除
  const url = API_ENDPOINTS.MOVIE_COMMENT_DETAIL(movieId, commentId);
  console.log(`[movieService -> deleteComment] Deleting from: ${url}`);
  return apiRequest(url, 'DELETE');
}