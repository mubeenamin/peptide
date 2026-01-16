'use client';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import NextImage from 'next/image';
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
    const untitledLayerRef = useRef<HTMLDivElement>(null);
    const productRef = useRef<HTMLDivElement>(null);

    // Frame Storage (Storing actual Image objects for Canvas)
    const veinsFrames = useRef<HTMLImageElement[]>([]);
    const boneFrames = useRef<HTMLImageElement[]>([]);
    const rbcFrames = useRef<HTMLImageElement[]>([]);
    const compFrames = useRef<HTMLImageElement[]>([]);
    const untitledFrames = useRef<HTMLImageElement[]>([]);

    // --- High-Performance Preloading ---
    useEffect(() => {
        const preload = (prefix: string, path: string, count: number, padding: number, store: React.MutableRefObject<HTMLImageElement[]>, startAt: number = 1, onFirstLoad?: () => void) => {
            const arr: HTMLImageElement[] = [];
            for (let i = startAt; i < startAt + count; i++) {
                const img = new Image();
                img.onload = () => {
                    if (i === startAt && onFirstLoad) onFirstLoad();
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
        preload('transparent', '/VEINS/', 90, 4, veinsFrames, 1, onFirstVeinLoad);
        preload('', '/BONE/', 67, 4, boneFrames, 1);
        preload('', '/RBC/', 120, 4, rbcFrames, 1);
        preload('Comp_', '/24/', 150, 5, compFrames, 0);
        preload('Untitled9_', '/30/', 120, 5, untitledFrames, 0);

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
            gsap.set(untitledLayerRef.current, { z: -1000, opacity: 0, scale: 0.5 });
            gsap.set(productRef.current, { z: -8000, opacity: 0, scale: 1 });


            // --- TIMELINE SEQUENCE ---
            // Total Duration: ~28s (Scrub based)

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
            tl.set(doctorRef.current, { opacity: 0, scale: 0.1, z: 0 }, 0);

            // Initial state for all 6 cards (2D-style)
            tl.set([".cardRight", ".cardLeft", ".card3", ".card4", ".card5", ".card6"], {
                opacity: 0,
                scale: 0.5,
                z: 0
            }, 0);

            tl.set(untitledLayerRef.current, { z: 0, opacity: 0, scale: 0.5 }, 0);
            tl.set(productRef.current, { z: 0, opacity: 0, scale: 1 }, 0);
            // No worldRef Z-init needed for 2D style

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


            // --- INTERMISSION: FLOATING CARDS ZOOM (9.0s - 17.75s) ---

            // Show first frame of RBC in background during cards
            tl.to(canvasRef.current, { opacity: 1, duration: 1.0, ease: "power1.in" }, 8.7);
            tl.to({}, {
                duration: 7.3, // Adjusted duration from 8.75 to 7.3 (8.75 - 1.45s shift)
                onUpdate: () => {
                    if (rbcFrames.current[0]) drawToCanvas(rbcFrames.current[0]);
                }
            }, 9.0);

            // SEQUENTIAL 2D-STYLE ZOOM (Scale based)
            // 1st Card (Right)
            tl.to(".cardRight", { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, 9.0);
            tl.to(".cardRight", { scale: 1.5, opacity: 0, duration: 1.2, ease: "power2.in" }, 10.5);

            // 2nd Card (Left)
            tl.to(".cardLeft", { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, 10.2);
            tl.to(".cardLeft", { scale: 1.5, opacity: 0, duration: 1.2, ease: "power2.in" }, 11.7);

            // 3rd Card (Top Left)
            tl.to(".card3", { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, 11.4);
            tl.to(".card3", { scale: 1.5, opacity: 0, duration: 1.2, ease: "power2.in" }, 12.9);

            // 4th Card (Bottom Right)
            tl.to(".card4", { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, 12.6);
            tl.to(".card4", { scale: 1.5, opacity: 0, duration: 1.2, ease: "power2.in" }, 14.1);

            // 5th Card (Top Right)
            tl.to(".card5", { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, 13.8);
            tl.to(".card5", { scale: 1.5, opacity: 0, duration: 1.2, ease: "power2.in" }, 15.3);

            // 6th Card (Bottom Left)
            tl.to(".card6", { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, 15.0);
            tl.to(".card6", { scale: 1.5, opacity: 0, duration: 1.2, ease: "power2.in" }, 16.5);

            // Final card finishes at 17.7s. Start next sequence accordingly.


            // --- PHASE 4: RBC SEQUENCE (starts at 17.7s) ---

            const rbcObj = { frame: 0 };
            tl.to(rbcObj, {
                frame: 119,
                duration: 4.0,
                ease: "none",
                onUpdate: () => {
                    const img = rbcFrames.current[Math.round(rbcObj.frame)];
                    if (img) drawToCanvas(img);
                }
            }, 17.7);


            // --- PHASE 5: COMP SEQUENCE (21.7s) ---
            const compObj = { frame: 0 };
            tl.to(compObj, {
                frame: 149,
                duration: 4.0,
                ease: "none",
                onUpdate: () => {
                    const img = compFrames.current[Math.round(compObj.frame)];
                    if (img) drawToCanvas(img);
                }
            }, 21.7);


            // --- PHASE 5.5: UNTITLED SEQUENCE (Folder 30) (25.7s) ---
            const untitledObj = { frame: 0 };
            tl.to(untitledObj, {
                frame: 119,
                duration: 4.0,
                ease: "none",
                onUpdate: () => {
                    const img = untitledFrames.current[Math.round(untitledObj.frame)];
                    if (img) drawToCanvas(img);
                }
            }, 25.7);

            // Untitled Text Overlay
            tl.to(untitledLayerRef.current, {
                opacity: 1,
                scale: 1,
                z: 0,
                duration: 1.5,
                ease: "power2.out"
            }, 26.2);

            tl.to(untitledLayerRef.current, {
                opacity: 0,
                scale: 1.5,
                z: 500,
                duration: 1.0,
                ease: "power2.in"
            }, 28.7);


            // --- PHASE 6: PRODUCT (30.2s) ---
            tl.set(productRef.current, { z: 0, opacity: 0, scale: 0.5 });

            tl.to(productRef.current, {
                z: 0,
                opacity: 1,
                scale: 1,
                duration: 2,
                ease: "power2.out"
            }, 30.2);

            tl.to(productRef.current, {
                rotateY: 20,
                duration: 2,
                ease: "power1.inOut"
            }, 29.7);

            tl.to({}, { duration: 2 }); // Buffer

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
                        height: '100%',
                        background: 'transparent' // Ensure bg is transparent
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
                    <div ref={doctorRef} className={`${styles.layer} ${styles.doctorLayer}`}>
                        <NextImage
                            src="/doc sec.jpeg"
                            alt="Research Team"
                            width={1094}
                            height={546}
                            className={styles.docFullImage}
                            priority
                        />
                    </div>

                    {/* INTERMISSION LAYER: Floating Cards */}
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

                        {/* 3rd Card: Top Left (24/7) */}
                        <div className={`${styles.cardFloating} ${styles.cardTopLeft} card3`}>
                            <div className={styles.cardTitle}>Quality <br /> Assurance</div>
                            <p className={styles.cardText}>
                                Comprehensive testing protocols for every batch, guaranteeing &gt;99% purity.
                            </p>
                        </div>

                        {/* 4th Card: Bottom Right (Global) */}
                        <div className={`${styles.cardFloating} ${styles.cardBottomRight} card4`}>
                            <div className={styles.cardTitle}>Global <br /> Shipping</div>
                            <p className={styles.cardText}>
                                Secure and temperature-controlled logistics for worldwide delivery.
                            </p>
                        </div>

                        {/* 5th Card: Top Right (Research) */}
                        <div className={`${styles.cardFloating} ${styles.cardTopRight} card5`}>
                            <div className={styles.cardTitle}>Research <br /> Innovation</div>
                            <p className={styles.cardText}>
                                Constant development of new peptide sequences for cutting-edge medical research.
                            </p>
                        </div>

                        {/* 6th Card: Bottom Left (Support) */}
                        <div className={`${styles.cardFloating} ${styles.cardBottomLeft} card6`}>
                            <div className={styles.cardTitle}>Technical <br /> Support</div>
                            <p className={styles.cardText}>
                                Expert guidance and consultation for all your research application needs.
                            </p>
                        </div>
                    </div>

                    {/* LAYER 3: Untitled/Folder 30 */}
                    <div ref={untitledLayerRef} className={`${styles.layer} ${styles.untitledLayer}`}>
                        <div className={styles.heroContent}>

                        </div>
                    </div>

                    {/* LAYER 4: Product Overlay */}
                    <div ref={productRef} className={`${styles.layer} ${styles.globeLayer}`}>
                        <div className={styles.layer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <NextImage
                                src="/1.png"
                                alt="Molecule"
                                width={1280}
                                height={720}
                                className={`${styles.productImage} productImage`}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
