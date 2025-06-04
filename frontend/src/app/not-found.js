// filepath: frontend/src/app/not-found.js
import Link from 'next/link';
import styles from '@/styles/NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.errorCard}> {/* 新增包裹的 div */}
        <h1 className={styles.title}>404 - 页面未找到</h1>
        <p className={styles.description}>
          抱歉，您要查找的页面不存在。
        </p>
        <Link href="/" legacyBehavior>
          <a className={styles.homeLink}>返回首页</a>
        </Link>
      </div>
    </div>
  );
}