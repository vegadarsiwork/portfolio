'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SiSpotify } from 'react-icons/si';

export default function Spotify() {
    // Mock data for now - can be replaced with real API later
    const [isPlaying, setIsPlaying] = useState(true);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="fixed bottom-8 left-8 z-40 hidden md:flex items-center gap-4 p-3 pr-6 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl hover:border-[#1DB954]/50 transition-colors group"
        >
            {/* Album Art / Icon */}
            <div className="relative w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0 overflow-hidden">
                <SiSpotify className="text-black text-xl" />
                {/* Rotating border effect */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-[spin_4s_linear_infinite]" />
            </div>

            {/* Track Info */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-[#1DB954] transition-colors">
                        Code & Chill
                    </span>

                    {/* Visualizer Bars */}
                    {isPlaying && (
                        <div className="flex items-end gap-[2px] h-3">
                            <motion.div
                                animate={{ height: [4, 12, 4] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="w-[2px] bg-[#1DB954] rounded-full"
                            />
                            <motion.div
                                animate={{ height: [8, 4, 12] }}
                                transition={{ repeat: Infinity, duration: 0.4 }}
                                className="w-[2px] bg-[#1DB954] rounded-full"
                            />
                            <motion.div
                                animate={{ height: [4, 10, 6] }}
                                transition={{ repeat: Infinity, duration: 0.6 }}
                                className="w-[2px] bg-[#1DB954] rounded-full"
                            />
                        </div>
                    )}
                </div>
                <span className="text-[10px] text-gray-400 max-w-[120px] truncate">
                    Lo-Fi Beats to Relax/Study to
                </span>
            </div>
        </motion.div>
    );
}
