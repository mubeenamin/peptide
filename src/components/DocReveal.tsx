'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function DocReveal() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"]
    });

    // Zoom in from 0.6 to 1 as it scrolls into view for dramatic entry
    const scale = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    return (
        <div ref={containerRef} style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
            <motion.img
                src="/doc model.png"
                alt="Scientific Model"
                style={{
                    scale,
                    opacity,
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    willChange: 'transform, opacity'
                }}
            />
        </div>
    );
}
