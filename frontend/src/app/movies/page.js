// filepath: frontend/src/app/movies/page.js
import MovieList from '@/components/MovieList';
import SearchInput from '@/components/SearchInput'; // 新增
import Pagination from '@/components/Pagination';   // 新增
import { getAllMovies } from '@/services/movieService'; // 从 service 导入
import styles from '@/styles/MoviesPage.module.css';

export const metadata = {
  title: '所有电影 - 电影网站',
  description: '浏览我们收集的全部电影作品，支持搜索和分页。',
};

// 本地备用数据，以防API调用失败 (这个备用数据不支持搜索和分页)
const localFallbackMovies = [
  { movie_id: 'local-1', yyy_title: '本地电影1 (备用)', description: '这是本地备用电影1的描述。', poster_image_url: '/taylor-swift-eras-tour.jpg' },
  { movie_id: 'local-2', yyy_title: '本地电影2 (备用)', description: '这是本地备用电影2的描述。', poster_image_url: '/taylor-swift-folklore.jpg' },
];

// MoviesPage 现在是一个 Server Component，它会接收 searchParams
export default async function MoviesPage({ searchParams }) {
  const searchQuery = searchParams?.search || '';
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const moviesPerPage = 8; // 您的设置
  
  console.log('[MoviesPage] searchQuery:', searchQuery);
  console.log('[MoviesPage] currentPage:', currentPage);
  console.log('[MoviesPage] moviesPerPage before calling service:', moviesPerPage); // <--- 确认这个值

  let moviesData = { movies: [], currentPage: 1, totalPages: 1, totalMovies: 0 };
  let fetchError = null;
  let usingFallbackData = false;

  try {
    const apiResponse = await getAllMovies(searchQuery, currentPage, moviesPerPage);
    console.log('[MoviesPage] API Response:', apiResponse); // <--- 添加这行日志
    moviesData = {
        movies: apiResponse.movies || [],
        currentPage: apiResponse.currentPage || currentPage,
        totalPages: apiResponse.totalPages || 1,
        totalMovies: apiResponse.totalMovies || 0,
    };
    if (moviesData.movies.length === 0 && searchQuery) {
        // 如果是搜索且没有结果，不算作 fetchError，但需要提示
    }

  } catch (error) {
    fetchError = error.message || '获取电影数据时发生未知错误。';
    console.warn(`[MoviesPage] API error, using fallback data: ${fetchError}`);
    // 当API失败时，备用数据不具备搜索和分页能力
    // 仅当没有搜索查询时，显示备用数据可能更有意义
    if (!searchQuery) {
        moviesData = {
            movies: localFallbackMovies,
            currentPage: 1,
            totalPages: 1,
            totalMovies: localFallbackMovies.length,
        };
        usingFallbackData = true;
    } else {
        // 如果有搜索查询且API失败，则显示错误，不显示备用数据
        moviesData.movies = []; // 确保不显示旧数据
    }
  }

  const noMoviesFoundForSearch = moviesData.movies.length === 0 && searchQuery && !fetchError && !usingFallbackData;
  const noMoviesAtAll = moviesData.movies.length === 0 && !searchQuery && !fetchError && !usingFallbackData;

  console.log('[MoviesPage] Before rendering MovieList, moviesData.movies IS:', moviesData.movies);
  console.log('[MoviesPage] Type of moviesData.movies IS:', typeof moviesData.movies);
  console.log('[MoviesPage] Is moviesData.movies an array?:', Array.isArray(moviesData.movies));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>所有电影</h1>
        <p className={styles.subtitle}>探索我们收藏的每一部精彩影片。</p>
      </header>

      <SearchInput /> {/* 添加搜索输入框 */}

      {fetchError && !usingFallbackData && (
        <div className={styles.errorContainer}>
          <h2>数据加载出错</h2>
          <p>错误详情: {fetchError}</p>
          <p>我们暂时无法加载电影列表，请稍后再试。</p>
        </div>
      )}

      {usingFallbackData && ( // 如果正在使用备用数据
        <div className={styles.warningContainer}>
          <h2>提示</h2>
          {fetchError && <p>目前无法连接到电影服务器。错误: {fetchError}</p>}
          <p>正在显示本地提供的备用电影数据 (不支持搜索和分页)。</p>
        </div>
      )}
      
      {noMoviesFoundForSearch && (
        <div className={styles.noDataContainer}>
          <h2>未找到结果</h2>
          <p>没有找到与 “{searchQuery}” 相关的电影。请尝试其他关键词。</p>
        </div>
      )}

      {noMoviesAtAll && (
         <div className={styles.noDataContainer}>
          <h2>暂无电影</h2>
          <p>目前电影库中没有内容，敬请期待更新！</p>
        </div>
      )}

      {moviesData.movies && moviesData.movies.length > 0 && ( // 确保 moviesData.movies 存在且有内容
        <MovieList movies={moviesData.movies} />
      )}

      {moviesData.movies.length > 0 && moviesData.totalPages > 1 && !usingFallbackData && (
        <Pagination
          currentPage={moviesData.currentPage}
          totalPages={moviesData.totalPages}
        />
      )}
    </div>
  );
}