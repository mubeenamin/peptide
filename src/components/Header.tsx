'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
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
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <img
                        src="/logo.svg"
                        alt="Peptide Logo"
                        className={styles.logoImage}
                    />
                </Link>

                {/* Right Side: Navigation Actions */}
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
            </div>
        </header>
    );
}
