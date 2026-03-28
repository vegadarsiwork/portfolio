'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  const borderOpacity = useTransform(scrollYProgress, [0, 1], [0.2, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-black" ref={containerRef}>
      <div className="container mx-auto px-4 py-16 md:py-20">
        <motion.div
          className="mb-12 max-w-3xl mx-auto text-center relative"
          style={{ scale }}
        >
          <div className="relative">
            {/* Glow border effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl -z-10 pointer-events-none"
              style={{
                opacity: borderOpacity,
                background: 'radial-gradient(circle at center, rgba(0, 255, 213, 0.2) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />

            <div className="relative rounded-2xl border border-white/10 px-6 py-8 md:px-8 md:py-10">

              <h3 className="mb-4 text-lg md:text-xl font-semibold text-white">
                Feel free to explore
              </h3>
              <p className="mb-4 text-sm md:text-base text-gray-400">
                Curious about hidden easter eggs? Press{' '}
                <kbd className="rounded border border-white/20 bg-white/5 px-2 py-1 text-xs font-mono text-white hover:border-accent-1/50 hover:bg-accent-1/10 transition-colors">
                  {isMac ? 'Cmd' : 'Ctrl'}
                </kbd>{' '}
                +{' '}
                <kbd className="rounded border border-white/20 bg-white/5 px-2 py-1 text-xs font-mono text-white hover:border-accent-1/50 hover:bg-accent-1/10 transition-colors">
                  K
                </kbd>
                {' '}to discover more
              </p>
              <p className="text-xs md:text-sm text-gray-500 md:hidden">
                (better experience on laptop)
              </p>
            </div>
          </div>
        </motion.div>

        <div className="border-t border-white/10 pt-6">
          <div className="text-center text-sm text-gray-400">
            © Vega Darsi · Built with minimalism, code, and curiosity. AI × UI × Web · Hyderabad, India
          </div>
        </div>
      </div>
    </footer>
  );
}
