'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import styles from './ZoomHero.module.css';

export default function ZoomHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // --- Phase 1: Clear Text & Overlay (0% - 15%) ---
    // Text: Zooms in and fades out quickly
    const textScale = useTransform(scrollYProgress, [0, 0.15], [1, 5]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 0.15], [0, 50]);

    // Overlay: Clears quickly to reveal image
    const overlayOpacity = useTransform(scrollYProgress, [0, 0.15], [0.5, 0]);

    // --- Phase 2: "3D" Zoom into Image (15% - 80%) ---
    // Scale: Zoom in significantly (1 -> 15)
    const imageScale = useTransform(scrollYProgress, [0.15, 0.8], [1, 15]);

    // Blur: Add motion blur (0px -> 20px)
    const imageBlur = useTransform(scrollYProgress, [0.15, 0.8], ["0px", "20px"]);

    // Opacity: Fade out quickly (starts at 50%, gone by 75%)
    // This creates a "white void" buffer before the next section appears
    const imageOpacity = useTransform(scrollYProgress, [0.5, 0.75], [1, 0]);

    return (
        <div ref={containerRef} className={styles.heroContainer}>
            <div className={styles.stickyWrapper}>
                {/* Background Image Container */}
                <motion.div
                    className={styles.imageContainer}
                    style={{
                        scale: imageScale,
                        opacity: imageOpacity,
                        filter: imageBlur,
                        transformOrigin: '60% 30%',
                        willChange: 'transform, filter, opacity'
                    }}
                >
                    <img
                        src="/vien.png"
                        alt="Background"
                        className={styles.bgImage}
                    />
                </motion.div>

                {/* White Overlay */}
                <motion.div
                    className={styles.overlay}
                    style={{ opacity: overlayOpacity }}
                />

                {/* Content Overlay */}
                <motion.div
                    className={styles.content}
                    style={{ opacity: textOpacity, scale: textScale, y: textY }}
                >
                    <h1 className={styles.title}>Discovery Through <br /><span className={styles.highlight}>Precision</span></h1>
                    <p className={styles.subtitle}>
                        Pioneering the next generation of peptide research with unmatched purity and scientific excellence.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
