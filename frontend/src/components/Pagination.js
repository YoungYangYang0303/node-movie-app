// filepath: frontend/src/components/Pagination.js
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from '@/styles/Pagination.module.css'; // 我们将创建这个CSS文件

export default function Pagination({ currentPage, totalPages }) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null; // 如果只有一页或没有页，则不显示分页
  }

  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `/movies?${params.toString()}`;
  };

  // 生成页码按钮的逻辑可以更复杂，这里简化为上一页/下一页
  const pageNumbers = [];
  const maxPagesToShow = 5; // 最多显示的页码按钮数
  let startPage, endPage;

  if (totalPages <= maxPagesToShow) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - Math.floor(maxPagesToShow / 2);
      endPage = currentPage + Math.floor(maxPagesToShow / 2);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }


  return (
    <nav className={styles.paginationNav} aria-label="分页">
      {currentPage > 1 && (
        <Link href={createPageURL(currentPage - 1)} legacyBehavior>
          <a className={styles.pageLink}>&laquo; 上一页</a>
        </Link>
      )}

      {startPage > 1 && (
        <>
          <Link href={createPageURL(1)} legacyBehavior>
            <a className={`${styles.pageLink} ${1 === currentPage ? styles.active : ''}`}>1</a>
          </Link>
          {startPage > 2 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {pageNumbers.map((number) => (
        <Link key={number} href={createPageURL(number)} legacyBehavior>
          <a className={`${styles.pageLink} ${number === currentPage ? styles.active : ''}`}>
            {number}
          </a>
        </Link>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages -1 && <span className={styles.ellipsis}>...</span>}
          <Link href={createPageURL(totalPages)} legacyBehavior>
            <a className={`${styles.pageLink} ${totalPages === currentPage ? styles.active : ''}`}>{totalPages}</a>
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link href={createPageURL(currentPage + 1)} legacyBehavior>
          <a className={styles.pageLink}>下一页 &raquo;</a>
        </Link>
      )}
    </nav>
  );
}