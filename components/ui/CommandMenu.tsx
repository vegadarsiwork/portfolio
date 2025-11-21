'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { Search, Github, Mail, Laptop, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandMenu() {
    const [open, setOpen] = useState(false);

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <>
            {/* Trigger Button (Floating) */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-sm text-gray-400 hover:text-white hover:bg-white/20 transition-all shadow-xl"
            >
                <span className="text-xs">⌘K</span>
            </button>

            {/* Dialog */}
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                        >
                            <Command label="Command Menu" className="bg-transparent">
                                <div className="flex items-center border-b border-white/10 px-3">
                                    <Search className="w-4 h-4 text-gray-500 mr-2" />
                                    <Command.Input
                                        autoFocus
                                        placeholder="Type a command or search..."
                                        className="w-full bg-transparent p-4 text-white outline-none placeholder:text-gray-500 font-sans"
                                    />
                                </div>

                                <Command.List className="p-2 max-h-[300px] overflow-y-auto">
                                    <Command.Empty className="p-4 text-center text-sm text-gray-500">No results found.</Command.Empty>

                                    <Command.Group heading="Navigation" className="text-xs text-gray-500 font-medium mb-2 px-2">
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.location.href = '#projects')}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Laptop className="w-4 h-4" />
                                            <span>Projects</span>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.location.href = '#about')}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Search className="w-4 h-4" />
                                            <span>About Me</span>
                                        </Command.Item>
                                    </Command.Group>

                                    <Command.Group heading="Social" className="text-xs text-gray-500 font-medium mb-2 px-2 mt-2">
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.open('https://github.com/vegadarsiwork', '_blank'))}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Github className="w-4 h-4" />
                                            <span>GitHub</span>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.location.href = 'mailto:vegadarsiwork@gmail.com')}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Mail className="w-4 h-4" />
                                            <span>Email Me</span>
                                        </Command.Item>
                                    </Command.Group>
                                </Command.List>
                            </Command>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
