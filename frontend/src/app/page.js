import MovieList from '@/components/MovieList';
import styles from '@/styles/Home.module.css'; // 假设您有 Home.module.css
// import { getAllMovies } from '@/services/movieService'; // 考虑统一使用 service

// 本地电影数据（当后端不可用时使用）
// 确保 localMovies 的结构与 MovieList 期望的电影对象结构一致
const localMovies = [
  { movie_id: 'local-1', yyy_title: "本地电影1 (备用)", poster_image_url: "/taylor-swift-eras-tour.jpg", description: "描述1" },
  { movie_id: 'local-2', yyy_title: "本地电影2 (备用)", poster_image_url: "/taylor-swift-folklore.jpg", description: "描述2" }
];

// 建议将数据获取逻辑移至 service，或者确保与 movieService.js 中的逻辑一致
async function getHomePageMovies() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
  // 修改这里：添加 sortBy=heat 参数，并可以调整 limit
  const moviesUrl = `${apiBaseUrl}/movies?sortBy=heat&page=1&limit=8`; // 获取第一页的前10部热门电影

  try {
    console.log('[HomePage] Fetching movies from:', moviesUrl);
    const res = await fetch(moviesUrl, { cache: 'no-store' });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: `HTTP error ${res.status}` }));
      console.error("[HomePage] 获取电影失败:", res.status, errorData);
      throw new Error(errorData.message || `获取电影失败 (${res.status})`);
    }
    
    const responseData = await res.json();
    console.log('[HomePage] API Response Data:', JSON.stringify(responseData, null, 2));

    if (!responseData || !Array.isArray(responseData.movies)) {
        if (responseData && Array.isArray(responseData.data)) {
            return responseData.data;
        }
        console.error('[HomePage] Invalid API response structure, expected movies array:', responseData);
        throw new Error('从API接收到的电影数据格式不正确 (HomePage)');
    }
    return responseData.movies;

  } catch (error) {
    console.error("[HomePage] getHomePageMovies 函数出错:", error);
    throw error;
  }
}

export default async function HomePage() {
  let moviesToDisplay = [];
  let fetchError = null;
  let usingFallbackData = false;

  try {
    moviesToDisplay = await getHomePageMovies();
  } catch (error) {
    console.warn(`[HomePage] API error, using fallback data: ${error.message}`);
    fetchError = error.message;
    moviesToDisplay = localMovies; // 使用本地备用数据
    usingFallbackData = true;
  }
  
  console.log('[HomePage] Movies to display:', moviesToDisplay);
  console.log('[HomePage] Type of moviesToDisplay:', typeof moviesToDisplay);
  console.log('[HomePage] Is moviesToDisplay an array?:', Array.isArray(moviesToDisplay));


  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>欢迎来到电影世界</h1>
        <p className={styles.description}>探索最新、最热门的电影</p>
      </div>

      {fetchError && usingFallbackData && (
        <div className={styles.warningContainer}>
          <h2>提示</h2>
          <p>目前无法连接到电影服务器。错误: {fetchError}</p>
          <p>正在显示本地提供的备用电影数据。</p>
        </div>
      )}
      
      {/* 确保 moviesToDisplay 是数组再传递 */}
      {Array.isArray(moviesToDisplay) && moviesToDisplay.length > 0 ? (
        <MovieList movies={moviesToDisplay} />
      ) : (
        !fetchError && !usingFallbackData && ( // 仅当没有错误且没用备用数据时显示“暂无”
          <div className={styles.noDataContainer}>
            <h2>暂无电影</h2>
            <p>目前电影库中没有内容，敬请期待更新！</p>
          </div>
        )
      )}
      
      {/* 你可以添加其他主页内容 */}
    </main>
  );
}