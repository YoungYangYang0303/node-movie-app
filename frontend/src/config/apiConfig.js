export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,

  // Movies
  MOVIES: `${API_BASE_URL}/movies`, // GET (all, search, paginate), POST (if admin can add)
  MOVIE_BY_ID: (movieId) => `${API_BASE_URL}/movies/${movieId}`, // GET (single movie)
  MOVIE_COMMENTS: (movieId) => `${API_BASE_URL}/movies/${movieId}/comments`, // GET, POST
  MOVIE_COMMENT_DETAIL: (movieId, commentId) => `${API_BASE_URL}/movies/${movieId}/comments/${commentId}`, // DELETE
  MOVIE_FAVORITE: (movieId) => `${API_BASE_URL}/movies/${movieId}/favorite`, // POST, DELETE
  MOVIE_IS_FAVORITE: (movieId) => `${API_BASE_URL}/movies/${movieId}/isFavorite`, // GET

  // Users (if you add user profile routes later)
  // USER_PROFILE: (userId) => `${API_BASE_URL}/users/${userId}`,
};