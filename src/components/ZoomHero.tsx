'use client';

import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import styles from './ZoomHero.module.css';

// --- Frame Sequence Background Component ---
function FrameSequenceBackground({ playbackValue }: { playbackValue: MotionValue<number> }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Use spring for "buttery smooth" scrubbing feel
    const smoothPlayback = useSpring(playbackValue, {
        stiffness: 150,
        damping: 30,
        mass: 0.5
    });

    const frameCount = 51;

    useEffect(() => {
        let loadedCount = 0;
        const imgArray: HTMLImageElement[] = [];

        // Preload Frame Sequence
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const fileName = `veinsv_${String(i).padStart(3, '0')}.png`;
            img.src = `/veinsv_frames/veinsv_frames/${fileName}`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount >= frameCount) setIsLoaded(true);
            };
            imgArray.push(img);
        }
        setImages(imgArray);
    }, []);

    // Canvas Rendering Loop
    useEffect(() => {
        let requestRef: number;

        const renderFrame = () => {
            if (!canvasRef.current || images.length === 0) return;

            const ctx = canvasRef.current.getContext('2d', { alpha: false });
            if (!ctx) return;

            const val = smoothPlayback.get();

            // Map timeline [0.0 -> 0.85]
            // Starts IMMEDIATELY
            let phase = 0;
            if (val < 0.85) {
                phase = val / 0.85;
            } else {
                phase = 1;
            }

            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(phase * (frameCount - 1))
            );

            const img = images[frameIndex];

            if (img && img.complete) {
                const canvas = canvasRef.current;
                const hRatio = canvas.width / img.width;
                const vRatio = canvas.height / img.height;
                const ratio = Math.max(hRatio, vRatio);

                const centerShift_x = (canvas.width - img.width * ratio) / 2;
                const centerShift_y = (canvas.height - img.height * ratio) / 2;

                ctx.drawImage(img,
                    0, 0, img.width, img.height,
                    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
                );
            }

            requestRef = requestAnimationFrame(renderFrame);
        };

        requestRef = requestAnimationFrame(renderFrame);

        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            cancelAnimationFrame(requestRef);
            window.removeEventListener('resize', handleResize);
        };
    }, [images, smoothPlayback]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: 'transparent' }}>
            <canvas
                ref={canvasRef}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease-in'
                }}
            />
            {!isLoaded && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    gap: '15px'
                }}>
                    <div className={styles.spinner}></div>
                    <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Initializing Experience...</span>
                </div>
            )}
        </div>
    );
}

export default function ZoomHero() {
    const containerRef = useRef<HTMLDivElement>(null);

    // DIRECT SCROLL BINDING
    // We bind directly to scrollYProgress instead of an animated value.
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // --- TRANSFORMS ---

    // 1. Zoom/Fade of Hero Text (0.0 -> 0.15)
    // As user starts scrolling, the text zooms in towards the viewer and fades out simultaneously.
    const textScale = useTransform(scrollYProgress, [0, 0.15], [1, 2.5]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

    // Overlay: REMOVED as requested ("remove overlay color")
    const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0, 0]);

    // 2. Video Scrubbing (0.05 -> 0.85)
    // Starts "when text little zoom" (0.05) instead of waiting for full fade
    // Handled inside FrameSequenceBackground

    // 3. Video Layer Visibility
    // Fades out at the end (0.85 -> 0.95) to show doctors
    const videoOpacity = useTransform(scrollYProgress, [0, 0.85, 0.95], [1, 1, 0]);

    // 4. Doctor Section Logic
    // REQUIREMENTS: Start size increase/reveal at Frame 41
    // Timeline Frame Start: 0.0. End: 0.85. Duration: 0.85.
    // Frame 41 Trigger: 0.0 + (0.85 * (41/51)) ~= 0.68.

    // Doc 2 grows over the final 10 frames (41->51)
    const doc2Opacity = useTransform(scrollYProgress, [0.68, 0.85], [0, 1]);
    const doc2Scale = useTransform(scrollYProgress, [0.68, 0.85], [0.3, 1]);
    const doc2Y = useTransform(scrollYProgress, [0.68, 0.85], ["15vh", "0vh"]);

    // Doc 1 stops at center ("0%")
    const doc1X = useTransform(scrollYProgress, [0.85, 1.0], ["120%", "0%"]);
    const doc1Opacity = useTransform(scrollYProgress, [0.85, 1.0], [0, 1]);

    return (
        <div ref={containerRef} className={styles.heroContainer}>
            <div className={styles.stickyWrapper}>
                {/* 1. Background Frame Layer */}
                <motion.div
                    className={styles.imageContainer}
                    style={{ opacity: videoOpacity, zIndex: 1 }}
                >
                    <FrameSequenceBackground playbackValue={scrollYProgress} />
                </motion.div>

                {/* 2. Overlay (Invisible now) */}
                <motion.div
                    className={styles.overlay}
                    style={{ opacity: overlayOpacity, backgroundColor: '#ffffff', zIndex: 2 }}
                />

                {/* 3. Hero Text */}
                <motion.div
                    className={styles.content}
                    style={{ opacity: textOpacity, scale: textScale, zIndex: 10 }}
                >
                    <h1 className={styles.title}>Discovery Through <br /></h1>
                    <p className={styles.subtitle}>
                        Pioneering the next generation of peptide research with unmatched purity and scientific excellence.
                    </p>
                </motion.div>

                {/* 4. Doctor Section */}
                <div className={styles.doctorSection} style={{ zIndex: 15 }}>
                    <motion.div
                        className={styles.doc1Wrapper}
                        style={{ x: doc1X, opacity: doc1Opacity }}
                    >
                        <img src="/doc1.png" alt="Lab Support" className={styles.doc1Image} />
                    </motion.div>

                    <motion.div
                        className={styles.doc2Wrapper}
                        style={{ opacity: doc2Opacity, scale: doc2Scale, y: doc2Y }}
                    >
                        <img src="/doc 2.png" alt="Chief Researcher" className={styles.doc2Image} />
                    </motion.div>
                </div>
            </div>

            {/* Extended height creates the 'track' for the scroll playback */}
            <div style={{ height: '500vh' }} />
        </div>
    );
}
