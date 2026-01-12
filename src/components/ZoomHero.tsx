'use client';

import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import styles from './ZoomHero.module.css';

// --- Generic Frame Sequence Component ---
interface FrameSequenceProps {
    playbackValue: MotionValue<number>;
    frameCount: number;
    folderPath: string;
    filePrefix: string;
    range: [number, number]; // [start, end] of the scroll timeline
}

function FrameSequenceBackground({ playbackValue, frameCount, folderPath, filePrefix, range }: FrameSequenceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const smoothPlayback = useSpring(playbackValue, {
        stiffness: 150,
        damping: 30,
        mass: 0.5
    });

    useEffect(() => {
        let loadedCount = 0;
        const imgArray: HTMLImageElement[] = [];

        // Preload Frame Sequence
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const fileName = `${filePrefix}${String(i).padStart(3, '0')}.png`;
            img.src = `${folderPath}${fileName}`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount >= frameCount) setIsLoaded(true);
            };
            img.onerror = () => console.warn(`Failed to load: ${folderPath}${fileName}`);
            imgArray.push(img);
        }
        setImages(imgArray);
    }, [frameCount, folderPath, filePrefix]);

    useEffect(() => {
        let requestRef: number;

        const renderFrame = () => {
            if (!canvasRef.current || images.length === 0) return;

            const ctx = canvasRef.current.getContext('2d', { alpha: false });
            if (!ctx) return;

            const val = smoothPlayback.get();
            const [start, end] = range;
            const duration = end - start;

            // Map global scroll value to local sequences progress (0 to 1)
            let phase = 0;
            if (val < start) {
                phase = 0;
            } else if (val > end) {
                phase = 1;
            } else {
                phase = (val - start) / duration;
            }

            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(phase * (frameCount - 1))
            );

            const img = images[frameIndex];

            if (img && img.complete) {
                const canvas = canvasRef.current;

                // Cover logic
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
    }, [images, smoothPlayback, range, frameCount]);

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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div className={styles.spinner}></div>
                </div>
            )}
        </div>
    );
}

export default function ZoomHero() {
    const containerRef = useRef<HTMLDivElement>(null);

    // TOTAL SCROLL TRACK: 800vh
    // 0.0 - 0.45: Veins Sequence
    // 0.35 - 0.55: Doctors Appear & Hold
    // 0.55 - 0.65: Transition (Docs Fade Out, DNA Fades In)
    // 0.65 - 1.00: DNA Sequence
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // --- 1. HERO TEXT (0 - 0.1) ---
    // Start immediately, slightly longer fade to match "time of play" feel
    const textScale = useTransform(scrollYProgress, [0, 0.1], [1, 2.5]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

    // --- 2. VEINS SEQUENCE (0 - 0.5) ---
    // Scrub extends to 0.5.
    // Fades out completely by 0.6.
    const veinsOpacity = useTransform(scrollYProgress, [0.5, 0.6], [1, 0]);

    // --- 3. DOCTOR REVEAL (0.35 - 0.5) -> FADE OUT (0.5 - 0.6) ---
    // Trigger relative to Veins scrub [0, 0.45]
    // Previous "Frame 41" logic was ~80% of scrub. 
    // 0.45 * 0.8 = 0.36. So we start around 0.36.
    // Strictly fade out BEFORE DNA starts (at 0.6).
    const doc2Opacity = useTransform(scrollYProgress, [0.36, 0.45, 0.5, 0.6], [0, 1, 1, 0]);
    const doc2Scale = useTransform(scrollYProgress, [0.36, 0.45], [0.3, 1]);
    const doc2Y = useTransform(scrollYProgress, [0.36, 0.45], ["15vh", "0vh"]);

    const doc1X = useTransform(scrollYProgress, [0.42, 0.5], ["120%", "0%"]);
    const doc1Opacity = useTransform(scrollYProgress, [0.42, 0.5, 0.5, 0.6], [0, 1, 1, 0]);

    // --- 4. DNA SEQUENCE (Scrub 0.6 - 1.0) ---
    // Fades in just as doctors leave
    // Fades in STRICTLY after Doctors are gone (0.6)
    const dnaOpacity = useTransform(scrollYProgress, [0.6, 0.7], [0, 1]);

    // --- 5. DNA PRODUCT REVEAL (1.png) ---
    // Trigger at DNA Frame 21.
    // DNA Range: [0.6, 1.0] (Duration 0.4).
    // Frame 21/50 = 42%.
    // Trigger = 0.6 + (0.4 * 0.42) = 0.768.
    const productOpacity = useTransform(scrollYProgress, [0.768, 1.0], [0, 1]);
    const productScale = useTransform(scrollYProgress, [0.768, 1.0], [0.3, 1]);
    const productY = useTransform(scrollYProgress, [0.768, 1.0], ["15vh", "0vh"]); // Float up effect


    return (
        <div ref={containerRef} className={styles.heroContainer}>
            <div className={styles.stickyWrapper}>

                {/* A. Veins Layer (Bottom) */}
                <motion.div
                    className={styles.imageContainer}
                    style={{ opacity: veinsOpacity, zIndex: 1 }}
                >
                    <FrameSequenceBackground
                        playbackValue={scrollYProgress}
                        folderPath="/veinsv_frames/veinsv_frames/"
                        filePrefix="veinsv_"
                        frameCount={51}
                        range={[0, 0.5]}
                    />
                </motion.div>

                {/* B. DNA Layer (Top, initially hidden) */}
                <motion.div
                    className={styles.imageContainer}
                    style={{ opacity: dnaOpacity, zIndex: 5 }}
                >
                    <FrameSequenceBackground
                        playbackValue={scrollYProgress}
                        folderPath="/dna_frames/" // Verified path
                        filePrefix="dna_"
                        frameCount={50}
                        range={[0.6, 1.0]} // Scrubs during the last 40% of page
                    />
                </motion.div>

                {/* C. Hero Text */}
                <motion.div
                    className={styles.content}
                    style={{ opacity: textOpacity, scale: textScale, zIndex: 10 }}
                >
                    <h1 className={styles.title}>Discovery Through <br /></h1>
                    <p className={styles.subtitle}>
                        Pioneering the next generation of peptide research with unmatched purity and scientific excellence.
                    </p>
                </motion.div>

                {/* D. Doctor Section (Over Veins, Under DNA transition) */}
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

                {/* E. DNA Product Section (Topmost) */}
                <motion.div
                    className={styles.productWrapper}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 20,
                        pointerEvents: 'none'
                    }}
                >
                    <motion.img
                        src="/1.png"
                        alt="Peptide Structure"
                        style={{
                            maxWidth: '40vw',
                            maxHeight: '60vh',
                            objectFit: 'contain',
                            scale: productScale,
                            opacity: productOpacity,
                            y: productY
                        }}
                    />
                </motion.div>
            </div>

            {/* Long scroll track to accommodate 2 full sequences + transitions */}
            <div style={{ height: '800vh' }} />
        </div>
    );
}
