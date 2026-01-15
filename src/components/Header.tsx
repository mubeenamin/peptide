'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            setIsLoggedIn(!!token);
        };

        checkAuth();

        // Listen for standard storage events (across tabs)
        window.addEventListener('storage', checkAuth);
        // Listen for our custom event (same tab)
        window.addEventListener('auth-change', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('auth-change', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setIsLoggedIn(false);
        window.location.href = '/login'; // Redirect to login
    };

    return (
        <header className={pathname === '/' ? styles.headerHome : styles.header}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/logo.svg"
                        alt="Peptide Logo"
                        width={500}
                        height={500}
                        className={styles.logoImage}
                        priority
                    />
                </Link>

                {/* Right Side: Navigation Actions - Hidden on Homepage */}
                {pathname !== '/' && (
                    <div className={styles.actions}>
                        {/* Search Bar */}
                        <div className={styles.searchBar}>
                            <input type="text" placeholder="Search..." className={styles.searchInput} />
                            <span className={styles.searchIcon}>🔍</span>
                        </div>

                        <div className={styles.topButtons}>
                            {isLoggedIn ? (
                                <button onClick={handleLogout} className={styles.navBtn} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', font: 'inherit' }}>
                                    Sign Out
                                </button>
                            ) : (
                                <Link href="/login" className={styles.navBtn}>
                                    Sign In
                                </Link>
                            )}
                            <Link href="/cart" className={styles.navBtn}>
                                Cart (0)
                            </Link>
                        </div>

                    </div>
                )}
            </div>
        </header>
    );
}
