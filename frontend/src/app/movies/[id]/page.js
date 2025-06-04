"use client";

import { useEffect, useState } from 'react'; // 确保 useState 已导入
import { useParams, useRouter } from 'next/navigation';
import { getMovieById, getCommentsByMovieId, addComment, favoriteMovie, unfavoriteMovie, checkFavoriteStatus, deleteComment } from '@/services/movieService'; // 更新导入
import { useAuth } from '@/context/AuthContext'; // 导入 useAuth
import styles from '@/styles/MovieDetails.module.css'; // We'll create this CSS file

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function MovieDetailsPage() {
  const params = useParams();
  const movieId = params.id;
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false); // 用于收藏/取消收藏操作的加载状态
  const [favoriteError, setFavoriteError] = useState(null); // 用于收藏操作的特定错误

  const { user, handleSessionExpired } = useAuth(); // 从 AuthContext 获取 user 和处理函数
  const router = useRouter(); // For navigation

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movieId) return;
      setIsLoading(true);
      setError(null);
      setFavoriteError(null); // 重置收藏错误

      try {
        const movieData = await getMovieById(movieId);
        setMovie(movieData);

        // 如果用户登录了，检查这部电影的收藏状态
        if (user) {
          setIsFavoriteLoading(true); // 开始加载收藏状态
          try {
            // 如果 checkFavoriteStatus 内部依赖 token，它会从 apiService 自动获取
            const favStatus = await checkFavoriteStatus(movieId); 
            setIsFavorited(favStatus.isFavorite);
          } catch (favErr) {
            console.error("获取收藏状态失败:", favErr);
            setFavoriteError("无法获取收藏状态，请稍后再试。");
            // 即使获取状态失败，也允许页面继续加载电影信息
          } finally {
            setIsFavoriteLoading(false); // 结束加载收藏状态
          }
        } else {
          setIsFavorited(false); // 用户未登录，则肯定未收藏
        }

      } catch (err) {
        console.error("加载电影详情失败:", err);
        setError(err.message || '加载电影详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId, user]); // 移除 token 作为依赖，因为 apiService 会处理

  useEffect(() => {
    const fetchComments = async () => {
      if (!movieId) return;
      try {
        const commentsData = await getCommentsByMovieId(movieId);
        setComments(commentsData);
      } catch (err) {
        console.error("Error fetching comments:", err);
        // setError(err.message || '加载评论失败'); // 避免覆盖电影详情的错误
      }
    };
    fetchComments();
  }, [movieId]);


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError('评论内容不能为空');
      return;
    }
    // if (!token) { // 这个检查仍然有用，判断用户是否已登录在 AuthContext层面
    //   setCommentError('请先登录再发表评论');
    //   return;
    // }
    if (!user) { // 更好的检查是检查 user 对象是否存在
        setCommentError('请先登录再发表评论');
        // router.push(`/login?redirect=/movies/${movieId}`);
        return;
    }

    setIsSubmittingComment(true);
    setCommentError('');

    try {
      const addedComment = await addComment(movieId, { comment_text: newComment }); // 移除了 token
      setComments(prevComments => [addedComment, ...prevComments]); // 将新评论添加到列表顶部
      setNewComment('');
    } catch (err) {
      console.error("Error submitting comment:", err);
      setCommentError(err.message || '评论失败，请稍后再试');
      if (err.message && (err.message.includes('过期') || err.message.includes('会话已过期'))) {
         if (handleSessionExpired) handleSessionExpired(); // 调用 AuthContext 的处理函数
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) { // 检查 user 对象
      setFavoriteError("请先登录才能收藏电影。");
      // router.push(`/login?redirect=/movies/${movieId}`);
      return;
    }

    setIsFavoriteLoading(true);
    setFavoriteError(null);
    try {
      let response;
      if (isFavorited) {
        response = await unfavoriteMovie(movieId); // 移除了 token
      } else {
        response = await favoriteMovie(movieId); // 移除了 token
      }
      setIsFavorited(response.isFavorite); // 根据后端返回的最新状态更新
    } catch (err) {
      console.error("收藏/取消收藏操作失败:", err);
      setFavoriteError(err.message || '操作失败，请稍后再试。');
      if (err.message && (err.message.includes('过期') || err.message.includes('会话已过期'))) {
        if (handleSessionExpired) handleSessionExpired();
      }
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleDeleteComment = async (commentIdToDelete) => {
    console.log(`Attempting to delete comment ID: ${commentIdToDelete}, User ID: ${user ? user.user_id : 'N/A'}`);
    if (!user) { // 检查 user 对象
      setCommentError('请先登录');
      return;
    }

    if (!window.confirm('您确定要删除这条评论吗？')) {
      return;
    }

    try {
      await deleteComment(movieId, commentIdToDelete); // 移除了 token
      setComments(prevComments => prevComments.filter(comment => comment.comment_id !== commentIdToDelete));
      console.log(`Comment ${commentIdToDelete} successfully marked for deletion from frontend state.`); // DEBUGGING
    } catch (err) {
      console.error("Error in handleDeleteComment function:", err); // Enhanced logging
      setCommentError(err.message || '删除评论失败，请稍后再试');
      if (err.message && (err.message.includes('过期') || err.message.includes('会话已过期'))) {
         if (handleSessionExpired) handleSessionExpired();
      }
    }
  };

  if (isLoading) return <div className={styles.loading}>加载中...</div>;
  if (error) return <div className={styles.errorContainer}>错误: {error}</div>;
  if (!movie) return <div className={styles.errorContainer}>未找到电影。</div>;

  return (
    <div className={styles.container}>
      <div className={styles.movieHeader}>
        {/* 应用新的 posterContainer 类 */}
        {movie?.poster_image_url && ( // 确保 movie 和 poster_image_url 存在
          <div className={styles.posterContainer}> 
            <img 
              src={movie.poster_image_url} 
              alt={`${movie.title || 'Movie'} poster`}  // <--- 修改这里
              className={styles.posterImage} // 应用新的 posterImage 类
            />
          </div>
        )}
        <div className={styles.movieInfo}>
          <h1 className={styles.title}>{movie.title || '无标题'}</h1> {/* <--- 修改这里 */}
          <p className={styles.tagline}>{movie.tagline}</p>
          <p><strong>上映日期:</strong> {movie.release_date ? formatDate(movie.release_date).split(' ')[0] : (movie.release_year || 'N/A')}</p>
          <p><strong>评分:</strong> {movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : (movie.rating || 'N/A')}</p>
          {/* 类型字段也需要确认，后端返回的是 genre (字符串)，前端期望的是 genres (数组) 或 genre */}
          <p><strong>类型:</strong> {movie.genre || (movie.genres && Array.isArray(movie.genres) ? movie.genres.map(g => g.name).join(', ') : 'N/A')}</p>
          {movie.director && <p><strong>导演:</strong> {movie.director}</p>}
          {/* 收藏按钮 - 仅当用户登录时显示 */}
          {user && (
            <button
              onClick={handleToggleFavorite}
              disabled={isFavoriteLoading}
              className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
              title={isFavorited ? '取消收藏' : '加入收藏'} // 添加 title 属性以提供提示
            >
              {isFavoriteLoading ? '⏳' : (isFavorited ? '❤️' : '🤍')} {/* 可以用加载图标替换文字 */}
            </button>
          )}
          {favoriteError && <p className={styles.errorTextSmall}>{favoriteError}</p>} {/* 显示收藏操作的错误 */}

        </div>
      </div>

      <div className={styles.overviewSection}>
        <h2>剧情简介</h2>
        <p>{movie.description || movie.overview || '暂无简介。'}</p> {/* <--- 修改这里：优先使用 description */}
      </div>

      <div className={styles.commentsSection}>
        <h3>评论区</h3>
        {user ? ( // 只有登录用户才能看到评论表单
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
              rows="4"
              disabled={isSubmittingComment}
            />
            {commentError && <p className={styles.commentError}>{commentError}</p>}
            <button type="submit" disabled={isSubmittingComment}>
              {isSubmittingComment ? '提交中...' : '发表评论'}
            </button>
          </form>
        ) : (
          <p>请 <a href="/login" className={styles.loginLink}>登录</a> 后发表评论。</p>
        )}
        {/* {!user && !authLoading && (
          <p className={styles.loginPrompt}>
            请 <a href="/login" className={styles.loginLink}>登录</a> 后发表评论。
          </p>
        )} */}

        {/* {loadingComments && <p>正在加载评论...</p>} */}
        {/* {!loadingComments && comments.length === 0 && <p>还没有评论。</p>} */}
        <ul className={styles.commentList}>
          {comments.map((comment) => {
            // DEBUGGING: Log user and comment data
            if (user) { // Only log if user object exists
              console.log(`Comment ID: ${comment.comment_id}, Comment User ID: ${comment.user_id} (type: ${typeof comment.user_id}), Logged-in User ID: ${user.user_id} (type: ${typeof user.user_id})`);
            } else {
              console.log(`Comment ID: ${comment.comment_id}, Comment User ID: ${comment.user_id}, Logged-in User: null`);
            }
            const canDelete = user && typeof user.user_id !== 'undefined' && typeof comment.user_id !== 'undefined' && String(user.user_id) === String(comment.user_id);
            // console.log(`Comment ID: ${comment.comment_id}, CanDelete: ${canDelete}`);

            return (
              <li key={comment.comment_id} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <p className={styles.commentMeta}>
                    由 <strong>{comment.username}</strong> 发表于 {formatDate(comment.created_at)}
                  </p>
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteComment(comment.comment_id)}
                      className={styles.deleteCommentButton}
                      title="删除评论"
                    >
                      🗑️ 删除
                    </button>
                  )}
                </div>
                <p className={styles.commentText}>{comment.comment_text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}