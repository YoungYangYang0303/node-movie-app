import Link from 'next/link';
import styles from '@/styles/Home.module.css'; // 确保导入了 Home.module.css

export default function MovieList({ movies }) {
  console.log('MovieList 接收到的 props:', { movies });
  console.log('Movies 数组:', movies);
  console.log('Movies 长度:', movies?.length);

  if (!movies || movies.length === 0) {
    console.log('没有电影数据，显示错误容器');
    return (
      <div className={styles.errorContainer}>
        <h2>暂无电影数据</h2>
        <p>请稍后再试或联系管理员</p>
      </div>
    );
  }

  return (
    <div className={styles.movieGrid}>
      {movies.map((movie, index) => {
        console.log(`渲染电影 ${index + 1}:`, movie);
        
        // 映射后端字段到前端期望的字段
        const title = movie.yyy_title || movie.title;
        const poster = movie.poster_image_url || movie.poster;
        const id = movie.movie_id || movie.id; // <--- 确保这个 id 是正确的唯一标识符
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : movie.year;
        const director = movie.director;
        const genre = movie.genre;
        const description = movie.description;
        const rating = movie.rating;
        
        console.log(`标题: ${title}, 海报路径: ${poster}`);
        
        if (!id) {
          console.warn("电影缺少有效ID，无法生成链接:", movie);
          // 可以选择渲染一个不可点击的卡片或跳过
          // return <div key={index} className={styles.movieCard}>... (无链接的卡片) ...</div>;
        }

        return (
          <Link
            key={id || index}
            href={`/movies/${id}`}
            passHref
            className={styles.movieCardLink} // <--- 添加这个类名
          >
            <div className={styles.movieCard}> {/* Link 的直接子元素 */}
              <div className={styles.moviePoster}>
                {poster ? (
                  <img
                    src={poster}
                    alt={title}
                  />
                ) : (
                  <div className={styles.posterPlaceholder}>
                    🎬
                  </div>
                )}
              </div>
              
              <div className={styles.movieInfo}>
                <h3 className={styles.movieTitle}>{title}</h3>
                
                <div className={styles.movieMeta}>
                  {year && (
                    <p className={styles.movieYear}>📅 {year}</p>
                  )}
                  {director && (
                    <p className={styles.movieDirector}>🎭 导演: {director}</p>
                  )}
                  {genre && (
                    <span className={styles.movieGenre}>{genre}</span>
                  )}
                </div>
                
                <p className={styles.movieDescription}>
                  {description || "暂无简介"}
                </p>
                
                {rating && (
                  <div className={styles.movieRating}>
                    <span className={styles.ratingLabel}>评分</span>
                    <span className={styles.ratingScore}>
                      ⭐ {rating}/10
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}