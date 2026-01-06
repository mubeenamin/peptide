'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await res.json();
            // Store token in localStorage (simplest for now)
            localStorage.setItem('token', data.token);
            localStorage.setItem('email', data.email);

            // Notify other components about the login change
            window.dispatchEvent(new Event('auth-change'));

            // Redirect to dashboard or home
            if (email.includes('admin')) {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Sign In</h1>
            <p className={styles.subtitle}>Welcome back to Peptide Sciences Clone</p>

            <form onSubmit={handleLogin} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                        placeholder="admin@example.com"
                    />
                    <p className={styles.hint} style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        Hint: admin@example.com / admin123
                    </p>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" className={styles.button}>
                    Sign In
                </button>
            </form>
        </div>
    );
}
