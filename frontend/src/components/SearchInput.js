// filepath: frontend/src/components/SearchInput.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '@/styles/SearchInput.module.css'; // 我们将创建这个CSS文件

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);

  // Sync input with URL search param if it changes externally
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search'); // 如果搜索词为空，则移除search参数
    }
    params.set('page', '1'); // 每次新搜索都回到第一页
    router.push(`/movies?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className={styles.searchForm}>
      <input
        type="text"
        placeholder="搜索电影名称..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
      <button type="submit" className={styles.searchButton}>
        搜索
      </button>
    </form>
  );
}