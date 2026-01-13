'use client';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ZoomHero.module.css';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function ZoomHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const worldRef = useRef<HTMLDivElement>(null);

    // Layer Refs
    const veinsRef = useRef<HTMLDivElement>(null);
    const doctorRef = useRef<HTMLDivElement>(null);
    const dnaRef = useRef<HTMLDivElement>(null);
    const productRef = useRef<HTMLDivElement>(null);

    // Frame Storage (Storing actual Image objects for Canvas)
    const veinsFrames = useRef<HTMLImageElement[]>([]);
    const boneFrames = useRef<HTMLImageElement[]>([]);
    const rbcFrames = useRef<HTMLImageElement[]>([]);
    const dnaFrames = useRef<HTMLImageElement[]>([]);

    // --- High-Performance Preloading ---
    useEffect(() => {
        const preload = (prefix: string, path: string, count: number, padding: number, store: React.MutableRefObject<HTMLImageElement[]>, onFirstLoad?: () => void) => {
            const arr: HTMLImageElement[] = [];
            for (let i = 1; i <= count; i++) {
                const img = new Image();
                img.onload = () => {
                    if (i === 1 && onFirstLoad) onFirstLoad();
                };
                img.src = `${path}${prefix}${String(i).padStart(padding, '0')}.png`;
                arr.push(img);
            }
            store.current = arr;
        };

        const onFirstVeinLoad = () => {
            if (veinsFrames.current[0]) drawToCanvas(veinsFrames.current[0]);
        };

        // updated counts based on folder contents
        preload('transparent', '/VEINS/', 90, 4, veinsFrames, onFirstVeinLoad);
        preload('', '/BONE/', 67, 4, boneFrames);
        preload('', '/RBC/', 120, 4, rbcFrames);
        preload('DNA_', '/DNA/', 150, 5, dnaFrames);

        // Handle Canvas Resize
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                if (veinsFrames.current[0]) drawToCanvas(veinsFrames.current[0]);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Canvas Drawing Utility (Wamos Air cinematic cover logic)
    const drawToCanvas = (img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas || !img.complete) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawW, drawH, offsetX, offsetY;

        if (canvasAspect > imgAspect) {
            drawW = canvas.width;
            drawH = canvas.width / imgAspect;
            offsetX = 0;
            offsetY = (canvas.height - drawH) / 2;
        } else {
            drawH = canvas.height;
            drawW = canvas.height * imgAspect;
            offsetX = (canvas.width - drawW) / 2;
            offsetY = 0;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    // --- GSAP Animation (Wamos Air Style) ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Draw first frame immediately if ready
            if (veinsFrames.current[0]) drawToCanvas(veinsFrames.current[0]);
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.5,
                    pinnedContainer: stickyRef.current,
                }
            });

            // 0. INITIAL STATE - Text visible on load
            gsap.set(veinsRef.current, { z: 0, opacity: 1 });
            gsap.set(".heroText", { z: 0, opacity: 1 });
            gsap.set(doctorRef.current, { z: 0, opacity: 0, scale: 0.1 });
            gsap.set(dnaRef.current, { z: 0, opacity: 0 });
            gsap.set(productRef.current, { z: -8000, opacity: 0, scale: 1 });


            // --- TIMELINE SEQUENCE ---
            // Total Duration: ~20s (Scrub based)

            // --- PHASE 1: VEINS (0 - 3.0s) ---
            const veinsObj = { frame: 0 };
            tl.to(veinsObj, {
                frame: 89,
                duration: 3.0,
                ease: "none",
                onUpdate: () => {
                    const img = veinsFrames.current[Math.round(veinsObj.frame)];
                    if (img) drawToCanvas(img);
                }
            }, 0);

            // Text: Zoom In & Fade Out
            tl.to(".heroText", {
                z: 2500,
                scale: 2,
                opacity: 0,
                duration: 1.5,
                ease: "power2.in"
            }, 0.5);


            // --- PHASE 2: BONE SEQUENCE (3.0s - 6.0s) ---
            // Starts immediately after Veins
            const boneObj = { frame: 0 };
            tl.to(boneObj, {
                frame: 66,
                duration: 3.0,
                ease: "none",
                onUpdate: () => {
                    const img = boneFrames.current[Math.round(boneObj.frame)];
                    if (img) drawToCanvas(img);
                }
            }, 3.0);

            // FADE OUT BONES (Canvas) to White when Doctor appears
            tl.to(canvasRef.current, { opacity: 0, duration: 0.5, ease: "power1.out" }, 6.0);


            // --- PHASE 3: DOCTOR OVERLAY (Starts AFTER Bone: 6.0s - 8.5s) ---
            // "Appear from small size and then gradually increase size"

            // 1. Initial State
            tl.set(doctorRef.current, { opacity: 0, scale: 0.5, z: 0 }, 0); // Start smaller
            tl.set([".cardLeft", ".cardRight"], { scale: 0.2, opacity: 0 }, 0);

            // 2. Appear & Zoom In (Start 6.0s)
            tl.to(doctorRef.current, {
                opacity: 1,
                scale: 1,
                duration: 1.0,
                ease: "power2.out"
            }, 6.0);

            // Continue Zooming (Gradual increase)
            tl.to(doctorRef.current, {
                scale: 1.2,
                duration: 1.5,
                ease: "none"
            }, 7.0);

            // 3. FADE OUT DOCTOR (at 8.5s)
            tl.to(doctorRef.current, {
                opacity: 0,
                scale: 1.3,
                duration: 0.5,
                ease: "power1.in"
            }, 8.5);


            // --- INTERMISSION: FLOATING CARDS ZOOM (9.0s - 11.5s) ---

            // 1st Card (Right)
            tl.fromTo(".cardRight",
                { scale: 0.2, opacity: 0, z: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
                9.0
            );
            tl.to(".cardRight", { scale: 1.5, duration: 1.2, ease: "none" }, 9.8);
            tl.to(".cardRight", { opacity: 0, duration: 0.2 }, 11.0);

            // 2nd Card (Left)
            tl.fromTo(".cardLeft",
                { scale: 0.2, opacity: 0, z: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
                9.6
            );
            tl.to(".cardLeft", { scale: 1.5, duration: 1.2, ease: "none" }, 10.4);
            tl.to(".cardLeft", { opacity: 0, duration: 0.2 }, 11.6);


            // --- PHASE 4: RBC SEQUENCE (11.5s - 15.5s) ---

            // Fade Canvas Back In (Show RBCs)
            tl.to(canvasRef.current, { opacity: 1, duration: 0.5, ease: "power1.in" }, 11.3);

            const rbcObj = { frame: 0 };
            tl.to(rbcObj, {
                frame: 119,
                duration: 4.0,
                ease: "none",
                onUpdate: () => {
                    const img = rbcFrames.current[Math.round(rbcObj.frame)];
                    if (img) drawToCanvas(img);
                }
            }, 11.5);


            // --- PHASE 5: DNA SEQUENCE (15.5s - 19.5s) ---



            const dnaObj = { frame: 0 };
            tl.to(dnaObj, {
                frame: 149,
                duration: 4.0,
                ease: "none",
                onUpdate: () => {
                    const img = dnaFrames.current[Math.round(dnaObj.frame)];
                    if (img) drawToCanvas(img);
                }
            }, 15.5);

            // DNA Overlay Opacity
            tl.to(dnaRef.current, { opacity: 1, duration: 1.0 }, 15.5);
            tl.to(dnaRef.current, { opacity: 0, duration: 1.0 }, 19.0);




            // --- PHASE 6: PRODUCT (20.0s - 24.0s) ---
            tl.set(productRef.current, { z: -1000, opacity: 0, scale: 0.5 });

            tl.to(productRef.current, {
                z: 0,
                opacity: 1,
                scale: 1,
                duration: 2,
                ease: "power2.out"
            }, 20.0);

            tl.to(productRef.current, {
                z: 0,
                opacity: 1,
                scale: 1,
                duration: 2,
                ease: "power2.out"
            }, 17.5);

            tl.to(productRef.current, {
                rotateY: 20,
                duration: 2,
                ease: "power1.inOut"
            }, 19.5);

            tl.to({}, { duration: 2 }); // Buffer // Buffer

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className={styles.heroContainer}>
            <div ref={stickyRef} className={styles.stickyWrapper}>

                {/* Wamos Air uses a single canvas for sequence rendering */}
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        width: '100%',
                        height: '100%'
                    }}
                />

                <div ref={worldRef} className={styles.scene3D} style={{ zIndex: 2 }}>

                    {/* LAYER 1: Text Overlays */}
                    <div ref={veinsRef} className={`${styles.layer} ${styles.veinsLayer}`}>
                        <div className={`${styles.heroContent} heroText`}>
                            <h1 className={styles.title}>Discovery Through <br /> Science</h1>
                            <p className={styles.subtitle}>
                                Pioneering the next generation of peptide research.
                            </p>
                        </div>
                    </div>

                    {/* LAYER 2: Doctor */}
                    {/* LAYER 2: Doctor */}
                    <div ref={doctorRef} className={`${styles.layer} ${styles.doctorLayer}`}>
                        <img
                            src="/doc sec.jpeg"
                            alt="Research Team"
                            className={styles.docFullImage}
                        />
                    </div>

                    {/* INTERMISSION LAYER: Floating Cards (Separate from Doctor) */}
                    <div className={`${styles.layer} ${styles.cardsLayer}`}>
                        {/* 1st Card: Right Side (GMP) */}
                        <div className={`${styles.cardFloating} ${styles.cardRight} cardRight`}>
                            <div className={styles.cardTitle}>GMP-Compliant <br /> Manufacturing</div>
                            <p className={styles.cardText}>
                                State-of-the-art facilities ensuring the highest purity levels for all peptide batches.
                            </p>
                        </div>

                        {/* 2nd Card: Left Side (Precise) */}
                        <div className={`${styles.cardFloating} ${styles.cardLeft} cardLeft`}>
                            <div className={styles.cardTitle}>Precise Amino <br /> Acid Sequencing</div>
                            <p className={styles.cardText}>
                                Share information on a previous project here to attract new clients.
                            </p>
                        </div>
                    </div>

                    {/* LAYER 3: DNA Overlay (Logic handled by Canvas) */}
                    <div ref={dnaRef} className={`${styles.layer} ${styles.dnaLayer}`}>
                    </div>

                    {/* LAYER 4: Product Overlay */}
                    <div ref={productRef} className={`${styles.layer} ${styles.globeLayer}`}>
                        <div className={styles.layer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/1.png" className={`${styles.productImage} productImage`} alt="Molecule" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
