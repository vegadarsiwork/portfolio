'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Props {
    children: React.ReactNode;
    width?: 'fit-content' | '100%';
    delay?: number;
}

export default function SectionReveal({ children, width = '100%', delay = 0 }: Props) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div ref={ref} style={{ width, position: 'relative' }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.8, delay: delay, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
                {children}
            </motion.div>
        </div>
    );
}
