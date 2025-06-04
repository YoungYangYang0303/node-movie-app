import Image from 'next/image';
// import Link from 'next/link'; // 可选: 如果你想链接到电影详情页
import styles from '@/styles/MovieCard.module.css';

export default function MovieCard({ movie }) {
  // 假设 poster_image_url 类似于 '/taylor-swift-eras-tour.jpg'
  // 并且你的 Next.js public 文件夹直接提供它。
  // 如果是来自 CDN 的绝对 URL，则可能不需要此检查。
  const posterSrc = movie.poster_image_url.startsWith('http')
    ? movie.poster_image_url
    : `${movie.poster_image_url}`; // 如果是相对于 public 文件夹

  return (
    // 可选: 如果有详情页，用 Link 包裹: <Link href={`/movies/${movie.movie_id}`}>
    <div className={styles.card}>
      {movie.poster_image_url && (
        <Image
          src={posterSrc}
          alt={movie.yyy_title}
          width={300} // 提供合适的宽度
          height={450} // 提供合适的高度
          className={styles.poster}
          priority={true} // 优先加载首屏可见的图片
          unoptimized={movie.poster_image_url.startsWith('http')} // 如果是外部绝对 URL
        />
      )}
      <div className={styles.content}>
        <div>
          <h3 className={styles.title}>{movie.yyy_title}</h3>
          <p className={styles.info}>
            <strong>导演:</strong> {movie.director || 'N/A'}
          </p>
          <p className={styles.info}>
            <strong>上映日期:</strong> {new Date(movie.release_date).toLocaleDateString() || 'N/A'}
          </p>
          <p className={styles.info}>
            <strong>类型:</strong> {movie.genre || 'N/A'}
          </p>
          {movie.rating && <p className={styles.rating}>评分: {movie.rating}/10</p>}
        </div>
        <p className={styles.description}>{movie.description}</p>
      </div>
    </div>
    // </Link>
  );
}