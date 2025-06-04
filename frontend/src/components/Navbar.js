"use client"; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: '首页' },
    { href: '/movies', label: '电影列表' },
    { href: '/about', label: '关于' },
  ];

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        电影项目
      </Link>
      
      <div className={styles.navLinks}>
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={pathname === item.href ? styles.active : ''}
          >
            {item.label}
          </Link>
        ))}
        
        {user ? (
          <>
            <span className={styles.userInfo}>欢迎, {user.username || '用户'}!</span>
            <button 
              onClick={logout} 
              className={styles.logoutButton} // Use specific logout button style
            >
              登出
            </button>
          </>
        ) : (
          <>
            <Link 
              href={`/login?redirect=${pathname}`} 
              className={pathname === '/login' ? styles.active : ''}
            >
              登录
            </Link>
            <Link 
              href="/register" 
              className={pathname === '/register' ? styles.active : ''}
            >
              注册
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}