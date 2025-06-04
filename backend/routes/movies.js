const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController'); // 导入 movieController

// 辅助函数：检查用户是否登录 (即 req.user 是否存在)
const ensureAuthenticated = (req, res, next) => {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: '未授权：此操作需要登录' });
  }
  next();
};

// GET /api/movies - 获取所有电影 (公开)
router.get('/', movieController.getAllMovies);

// GET /api/movies/:id - 获取单个电影详情 (公开)
router.get('/:id', movieController.getMovieById);

// GET /api/movies/:id/comments - 获取电影评论 (公开)
router.get('/:id/comments', movieController.getMovieComments);

// POST /api/movies/:id/comments - 添加评论 (需要认证)
router.post('/:id/comments', ensureAuthenticated, movieController.addMovieComment);

// DELETE /api/movies/:movieId/comments/:commentId - 删除评论 (需要认证)
router.delete('/:movieId/comments/:commentId', ensureAuthenticated, movieController.deleteMovieComment);

// POST /api/movies/:movieId/favorite - 收藏电影 (需要认证)
router.post('/:movieId/favorite', ensureAuthenticated, movieController.favoriteMovie);

// DELETE /api/movies/:movieId/favorite - 取消收藏电影 (需要认证)
router.delete('/:movieId/favorite', ensureAuthenticated, movieController.unfavoriteMovie);

// GET /api/movies/:movieId/isFavorite - 检查电影是否已收藏 (需要认证)
router.get('/:movieId/isFavorite', ensureAuthenticated, movieController.checkFavoriteStatus);

module.exports = router;