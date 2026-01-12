'use client';

import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent, animate, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import styles from './ZoomHero.module.css';

// --- Frame Sequence Background Component ---
function FrameSequenceBackground({ playbackValue }: { playbackValue: MotionValue<number> }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Smooth out the playback value to prevent jitter between frames
    // This adds artificial interpolation physics to the frame selection
    const smoothPlayback = useSpring(playbackValue, {
        stiffness: 150,
        damping: 30,
        mass: 0.5
    });

    // Actual count verified from filesystem is 51 frames
    const frameCount = 51;

    useEffect(() => {
        let loadedCount = 0;
        const imgArray: HTMLImageElement[] = [];

        // Preload Frame Sequence
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const fileName = `veinsv_${String(i).padStart(3, '0')}.png`;
            // Verified path
            img.src = `/veinsv_frames/veinsv_frames/${fileName}`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount >= frameCount) setIsLoaded(true); // Wait for 100% for perfect smoothness
            };
            imgArray.push(img);
        }
        setImages(imgArray);
    }, []);

    // High-performance canvas rendering loop
    useEffect(() => {
        let requestRef: number;
        // Last rendered frame index cache to avoid clearing canvas if frame hasn't changed
        // However, for super smooth interpolation we might want to redraw. 
        // With only 51 frames over 15 seconds, we have ~3.4 frames per second if linear.
        // 51 frames is very low for a 15s animation (needs approx 450 frames for 30fps).
        // WE CANNOT FIX FPS if source is low, but we can prevent flickers.

        const renderFrame = () => {
            // 51 frames is low. We can't interpolate 'between' frames on a canvas without complex pixel blending.
            // Best we can do is ensure the transition logic is perfectly stable.
            if (!canvasRef.current || images.length === 0) return;

            const ctx = canvasRef.current.getContext('2d', { alpha: false }); // Optimize for no transparency if full cover
            if (!ctx) return;

            const val = smoothPlayback.get();

            // Map timeline [0.2 -> 0.9]
            let phase = 0;
            if (val > 0.2 && val < 0.9) {
                phase = (val - 0.2) / 0.7;
            } else if (val >= 0.9) {
                phase = 1;
            }

            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(phase * (frameCount - 1))
            );

            const img = images[frameIndex];

            if (img && img.complete) {
                const canvas = canvasRef.current;

                // Calculate cover dimensions only once per resize ideally, but here for safety
                // Optimization: Math.max is cheap.
                const hRatio = canvas.width / img.width;
                const vRatio = canvas.height / img.height;
                const ratio = Math.max(hRatio, vRatio);

                const centerShift_x = (canvas.width - img.width * ratio) / 2;
                const centerShift_y = (canvas.height - img.height * ratio) / 2;

                // No need to clearRect if we draw over everything with opacity 1 image.
                // Assuming images are fully opaque.
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
                // Match resolution to display size for sharpness
                // Can reduce resolution for performance if needed, but quality is priority 
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
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#fff' }}>
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
                    <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Sourcing High-Res Frames...</span>
                </div>
            )}
        </div>
    );
}

export default function ZoomHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const targetState = useRef<number>(0);
    const cinematicProgress = useMotionValue(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const prev = scrollYProgress.getPrevious() || 0;

        if (latest > prev && latest > 0.02 && targetState.current !== 1) {
            targetState.current = 1;
            // DURATION NOTE: 
            // 15 seconds for 51 frames = 3.4 fps. This is extremely choppy natively.
            // Reduced frame count forces us to speed up the animation to make it look smooth.
            // 51 frames @ 15fps = ~3.5 seconds.
            // We set duration to 4.5s to strike a balance between slow-mo and smoothness.
            animate(cinematicProgress, 1, {
                duration: 4.5,
                ease: "linear"
            });
        }
        else if (latest < prev && latest < 0.98 && targetState.current !== 0) {
            targetState.current = 0;
            animate(cinematicProgress, 0, {
                duration: 4,
                ease: "linear"
            });
        }
    });

    // --- TRANSFORMS ---
    // Text Phase (0.0 -> 0.2)
    const textScale = useTransform(cinematicProgress, [0, 0.25], [1, 3]);
    const textOpacity = useTransform(cinematicProgress, [0, 0.2], [1, 0]);

    // Overlay logic
    const overlayOpacity = useTransform(cinematicProgress, [0, 0.2], [0.6, 0]);

    // Opacity logic
    const videoOpacity = useTransform(cinematicProgress, [0, 0.9, 0.95], [1, 1, 0]);

    // Doctor Logic
    const doc2Opacity = useTransform(cinematicProgress, [0.9, 0.98], [0, 1]);
    const doc2Scale = useTransform(cinematicProgress, [0.9, 1.0], [0.85, 1]);
    const doc1X = useTransform(cinematicProgress, [0.92, 1.0], ["120%", "-30%"]);
    const doc1Opacity = useTransform(cinematicProgress, [0.92, 1.0], [0, 1]);

    return (
        <div ref={containerRef} className={styles.heroContainer}>
            <div className={styles.stickyWrapper}>
                <motion.div
                    className={styles.imageContainer}
                    style={{ opacity: videoOpacity, zIndex: 1 }}
                >
                    <FrameSequenceBackground playbackValue={cinematicProgress} />
                </motion.div>

                <motion.div
                    className={styles.overlay}
                    style={{ opacity: overlayOpacity, backgroundColor: '#ffffff', zIndex: 2 }}
                />

                <motion.div
                    className={styles.content}
                    style={{ opacity: textOpacity, scale: textScale, zIndex: 10 }}
                >
                    <h1 className={styles.title}>Discovery Through <br /><span className={styles.highlight}>Precision</span></h1>
                    <p className={styles.subtitle}>
                        Pioneering the next generation of peptide research with unmatched purity and scientific excellence.
                    </p>
                </motion.div>

                <div className={styles.doctorSection} style={{ zIndex: 15 }}>
                    <motion.div
                        className={styles.doc1Wrapper}
                        style={{ x: doc1X, opacity: doc1Opacity }}
                    >
                        <img src="/doc1.png" alt="Lab Support" className={styles.doc1Image} />
                    </motion.div>

                    <motion.div
                        className={styles.doc2Wrapper}
                        style={{ opacity: doc2Opacity, scale: doc2Scale }}
                    >
                        <img src="/doc 2.png" alt="Chief Researcher" className={styles.doc2Image} />
                    </motion.div>
                </div>
            </div>

            <div style={{ height: '300vh' }} />
        </div>
    );
}
