'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check for token on mount
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
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
                {/* Logo Area */}
                <Link href="/" className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '40px',
                        height: '30px',
                        background: '#D32F2F',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        🐘
                    </div>
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

                    <nav className={styles.pillsNav}>
                        <Link href="#" className={styles.pill}>Peptide Capsules</Link>
                        <Link href="#" className={styles.pill}>Peptide Blends</Link>
                        <Link href="#" className={styles.pill}>IGF-1 Proteins</Link>
                        <Link href="#" className={styles.pill}>Melanotan Peptides</Link>
                        <Link href="#" className={styles.pill}>Bioregulators</Link>
                        <Link href="#" className={styles.pill}>Cosmetic Peptides</Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
