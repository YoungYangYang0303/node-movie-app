const db = require('../db');

// 获取所有电影
exports.getAllMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'date'; // 默认按日期排序
    
    let query;
    let countQuery = 'SELECT COUNT(*) as total FROM movies';
    
    // 根据sortBy参数确定排序方式和查询
    if (sortBy === 'heat') {
      // 热门排序: 按照评论数和收藏数进行排序
      query = `
        SELECT m.movie_id, m.yyy_title AS title, m.director, m.release_date, 
        m.poster_image_url, m.description, m.genre, m.rating, m.duration_minutes,
        COUNT(DISTINCT c.comment_id) AS comment_count,
        COUNT(DISTINCT f.user_id) AS favorite_count,
        (COUNT(DISTINCT c.comment_id) + COUNT(DISTINCT f.user_id) * 2) AS heat_score
        FROM movies m
        LEFT JOIN comments c ON m.movie_id = c.movie_id
        LEFT JOIN user_favorites f ON m.movie_id = f.movie_id
        GROUP BY m.movie_id
        ORDER BY heat_score DESC, m.release_date DESC
        LIMIT ? OFFSET ?
      `;
      console.log(`[MovieController] 排序方式: ${sortBy} -> 按评论数和收藏数排序`);
    } else if (sortBy === 'date') {
      // 日期排序
      query = `
        SELECT movie_id, yyy_title AS title, director, release_date, 
        poster_image_url, description, genre, rating, duration_minutes 
        FROM movies
        ORDER BY release_date DESC
        LIMIT ? OFFSET ?
      `;
      console.log(`[MovieController] 排序方式: ${sortBy} -> 按发布日期排序`);
    } else {
      // 默认排序
      query = `
        SELECT movie_id, yyy_title AS title, director, release_date, 
        poster_image_url, description, genre, rating, duration_minutes 
        FROM movies
        ORDER BY release_date DESC, yyy_title ASC
        LIMIT ? OFFSET ?
      `;
      console.log(`[MovieController] 排序方式: ${sortBy} -> 默认排序`);
    }
    
    console.log(`Executing SQL for getAllMovies: ${query}`);
    console.log(`With params: [${limit}, ${offset}]`);
    
    const [movies] = await db.query(query, [limit, offset]);
    
    // 获取总电影数量
    const [countResult] = await db.query(countQuery);
    const totalMovies = countResult[0].total;
    const totalPages = Math.ceil(totalMovies / limit);
    
    res.json({
      success: true,
      data: movies,
      pagination: {
        page,
        limit,
        totalMovies,
        totalPages
      }
    });
  } catch (err) {
    console.error('获取电影列表错误:', err);
    res.status(500).json({ 
      success: false, 
      error: '获取电影列表失败' 
    });
  }
};

// 获取单个电影详情
exports.getMovieById = async (req, res) => {
  const { id } = req.params;
  try {
    // 将 genres 修改为 genre
    const sqlQuery = 'SELECT movie_id, yyy_title AS title, director, release_date, poster_image_url, description, genre, rating, duration_minutes FROM movies WHERE movie_id = ?';
    console.log("Executing SQL for getMovieById:", sqlQuery);
    console.log("With params:", [id]);

    const [rows] = await db.query(sqlQuery, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '电影未找到' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`获取电影 ${id} 详情错误:`, err);
    res.status(500).json({ error: '服务器内部错误', details: err.message });
  }
};

// 获取电影评论
exports.getMovieComments = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT c.comment_id, c.movie_id, c.user_id, c.comment_text, c.created_at, u.username 
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.movie_id = ? 
      ORDER BY c.created_at DESC
    `;
    const [comments] = await db.query(query, [id]);
    res.json(comments);
  } catch (err) {
    console.error(`获取电影 ${id} 评论错误:`, err);
    res.status(500).json({ error: '服务器内部错误', details: err.message });
  }
};

// 添加评论
exports.addMovieComment = async (req, res) => {
  const { id: movieId } = req.params;
  const { comment_text } = req.body;
  const userId = req.user.user_id;

  if (!comment_text || comment_text.trim() === '') {
    return res.status(400).json({ error: '评论内容不能为空' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO comments (movie_id, user_id, comment_text) VALUES (?, ?, ?)',
      [movieId, userId, comment_text]
    );
    const insertId = result.insertId;
    const [newCommentRows] = await db.query(
        `SELECT c.comment_id, c.movie_id, c.user_id, c.comment_text, c.created_at, u.username 
         FROM comments c
         JOIN users u ON c.user_id = u.user_id
         WHERE c.comment_id = ?`,
        [insertId]
    );
    if (newCommentRows.length === 0) {
        return res.status(500).json({ error: '评论添加成功但无法检索' });
    }
    res.status(201).json(newCommentRows[0]);
  } catch (err) {
    console.error(`为电影 ${movieId} 添加评论错误:`, err);
    res.status(500).json({ error: '服务器内部错误', details: err.message });
  }
};

// 删除评论
exports.deleteMovieComment = async (req, res) => {
  const { movieId, commentId } = req.params;
  const userId = req.user.user_id;

  try {
    const [commentRows] = await db.query('SELECT user_id FROM comments WHERE comment_id = ? AND movie_id = ?', [commentId, movieId]);
    if (commentRows.length === 0) {
      return res.status(404).json({ error: '评论未找到' });
    }
    if (commentRows[0].user_id !== userId) {
      return res.status(403).json({ error: '无权删除此评论' });
    }

    const [result] = await db.query('DELETE FROM comments WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '评论未找到或无权删除' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(`删除评论 ${commentId} 错误:`, err);
    res.status(500).json({ error: '服务器内部错误', details: err.message });
  }
};

// 收藏电影
exports.favoriteMovie = async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.user_id;
  try {
    const [existing] = await db.query('SELECT * FROM user_favorites WHERE user_id = ? AND movie_id = ?', [userId, movieId]);
    if (existing.length > 0) {
      return res.status(200).json({ message: '已收藏', isFavorite: true });
    }
    await db.query('INSERT INTO user_favorites (user_id, movie_id) VALUES (?, ?)', [userId, movieId]);
    res.status(201).json({ message: '收藏成功', isFavorite: true });
  } catch (err) {
    console.error(`收藏电影 ${movieId} 错误:`, err);
    res.status(500).json({ error: '服务器内部错误', details: err.message });
  }
};

// 取消收藏电影
exports.unfavoriteMovie = async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.user_id;
  try {
    const [result] = await db.query('DELETE FROM user_favorites WHERE user_id = ? AND movie_id = ?', [userId, movieId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '未找到收藏记录', isFavorite: false });
    }
    res.status(200).json({ message: '取消收藏成功', isFavorite: false });
  } catch (err) {
    console.error(`取消收藏电影 ${movieId} 错误:`, err);
    res.status(500).json({ error: '服务器内部错误', details: err.message });
  }
};

// 检查电影是否已收藏
exports.checkFavoriteStatus = async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.user_id;
    try {
        const [rows] = await db.query('SELECT * FROM user_favorites WHERE user_id = ? AND movie_id = ?', [userId, movieId]);
        res.json({ isFavorite: rows.length > 0 });
    } catch (err) {
        console.error(`检查电影 ${movieId} 收藏状态错误:`, err);
        res.status(500).json({ error: '服务器内部错误', details: err.message });
    }
};