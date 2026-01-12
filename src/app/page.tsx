import ZoomHero from '@/components/ZoomHero';
import styles from './page.module.css';

export default function ShopHome() {
    return (
        <main className={styles.pageWrapper}>
            <ZoomHero />

            {/* Added extra height below to ensure full context for scroll animation */}
            <div style={{ position: 'relative', zIndex: 10, marginTop: '200vh', backgroundColor: '#ffffff', minHeight: '100vh' }}>
                <div className="container" style={{ paddingTop: '50px', textAlign: 'center' }}>

                    <h2 style={{ fontSize: '3rem', fontWeight: '700', color: '#1a1a1a' }}>Scientific Innovation</h2>
                    <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '20px auto' }}>
                        Our research chemicals are developed with the highest standards of precision and quality control.
                    </p>
                </div>
            </div>
        </main>
    );
}
