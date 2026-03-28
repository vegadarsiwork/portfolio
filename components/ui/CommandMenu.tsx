'use client';

import { Command } from 'cmdk';
import {
    Search,
    Github,
    Mail,
    FolderKanban,
    Wrench,
    User,
    ArrowUp,
    Home,
    Linkedin,
    Link,
    Copy,
    Dice5,
    Coins,
    Sparkles,
    Gamepad2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<string>('');
    const [miniGame, setMiniGame] = useState<{ type: 'coin' | 'dice' | '8ball'; text: string } | null>(null);

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

    const runCommand = (command: () => void, close = true) => {
        if (close) {
            setOpen(false);
        }
        command();
    };

    const showResult = (text: string) => {
        setResult(text);
    };

    const coinFlip = () => {
        const value = Math.random() > 0.5 ? 'Heads' : 'Tails';
        const text = `Coin flip: ${value}`;
        showResult(text);
        setMiniGame({ type: 'coin', text });
    };

    const rollDice = () => {
        const value = Math.floor(Math.random() * 20) + 1;
        const text = `D20 roll: ${value}`;
        showResult(text);
        setMiniGame({ type: 'dice', text });
    };

    const magicAnswer = () => {
        const responses = [
            'Absolutely. Ship it.',
            'Yes, and sooner than expected.',
            'Looks good. One more polish pass.',
            'Maybe later. Focus on core first.',
            'Not now. Pick the simpler option.',
            'Ask after one coffee.',
        ];
        const pick = responses[Math.floor(Math.random() * responses.length)];
        const text = `8-ball: ${pick}`;
        showResult(text);
        setMiniGame({ type: '8ball', text });
    };

    const rerollMiniGame = () => {
        if (!miniGame) {
            return;
        }

        if (miniGame.type === 'coin') {
            coinFlip();
            return;
        }

        if (miniGame.type === 'dice') {
            rollDice();
            return;
        }

        magicAnswer();
    };

    const miniGameLabel = miniGame?.type === 'coin'
        ? 'coin toss'
        : miniGame?.type === 'dice'
            ? 'd20 roller'
            : miniGame?.type === '8ball'
                ? 'magic 8-ball'
                : '';

    const renderMiniGameVisual = () => {
        if (!miniGame) {
            return null;
        }

        if (miniGame.type === 'coin') {
            const coinValue = miniGame.text.split(': ')[1] ?? 'Heads';

            return (
                <motion.div
                    key={`coin-${miniGame.text}`}
                    initial={{ rotateY: 0, scale: 0.9, opacity: 0 }}
                    animate={{ rotateY: 1080, scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-accent-1/50 bg-accent-1/10 text-xs font-semibold uppercase tracking-wide text-accent-1"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {coinValue}
                </motion.div>
            );
        }

        if (miniGame.type === 'dice') {
            const diceValue = miniGame.text.split(': ')[1] ?? '1';

            return (
                <motion.div
                    key={`dice-${miniGame.text}`}
                    initial={{ x: -8, rotate: -10, opacity: 0 }}
                    animate={{ x: [0, -10, 10, -8, 8, 0], rotate: [0, -16, 16, -10, 10, 0], opacity: 1 }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-lg font-bold text-white"
                >
                    {diceValue}
                </motion.div>
            );
        }

        return (
            <motion.div
                key={`eightball-${miniGame.text}`}
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: [0.95, 1.04, 1], opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-accent-2/45 bg-gradient-to-br from-white/10 to-accent-2/15 text-[11px] font-bold uppercase tracking-wide text-white"
            >
                8 ball
            </motion.div>
        );
    };

    const copyToClipboard = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            showResult(`${label} copied.`);
        } catch {
            showResult(`Could not copy ${label.toLowerCase()}.`);
        }
    };

    return (
        <>
            <AnimatePresence>
                {miniGame && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="fixed bottom-24 right-6 z-50 w-[min(92vw,320px)] overflow-hidden rounded-xl border border-accent-1/40 bg-[#111]/95 shadow-2xl shadow-accent-1/20 backdrop-blur-md"
                    >
                        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-accent-1/50 animate-pulse" />

                        <div className="relative z-10 border-b border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-white/60">
                            mini game · {miniGameLabel}
                        </div>

                        <div className="relative z-10 px-4 py-4">
                            <div className="flex justify-center">
                                {renderMiniGameVisual()}
                            </div>

                            <p className="mb-4 text-sm text-white">{miniGame.text}</p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={rerollMiniGame}
                                    className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-wide text-gray-200 transition hover:bg-white/10"
                                >
                                    reroll
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMiniGame(null)}
                                    className="rounded-md border border-white/10 px-3 py-1.5 text-xs uppercase tracking-wide text-gray-400 transition hover:text-white"
                                >
                                    close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button (Floating) */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-8 right-8 z-40 flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm text-gray-300 shadow-lg backdrop-blur-md transition-colors hover:bg-black/90 hover:text-white"
            >
                <Sparkles className="h-3.5 w-3.5 text-accent-1" />
                <span className="text-xs">cmd palette</span>
                <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/70">⌘K</span>
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
                                <div className="border-b border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-white/55">
                                    fast actions, navigation, and mini games
                                </div>

                                <div className="flex items-center border-b border-white/10 px-3">
                                    <Search className="w-4 h-4 text-gray-500 mr-2" />
                                    <Command.Input
                                        autoFocus
                                        placeholder="Search commands..."
                                        className="w-full bg-transparent p-4 text-white outline-none placeholder:text-gray-500 font-sans"
                                    />
                                </div>

                                {!!result && (
                                    <div className="border-b border-white/10 bg-accent-1/8 px-4 py-2 text-sm text-accent-1">
                                        {result}
                                    </div>
                                )}

                                <Command.List className="p-2 max-h-[300px] overflow-y-auto">
                                    <Command.Empty className="p-4 text-center text-sm text-gray-500">No results found.</Command.Empty>

                                    <Command.Group heading="Navigation" className="text-xs text-gray-500 font-medium mb-2 px-2">
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.location.href = '#')}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Home className="w-4 h-4" />
                                            <span>Home</span>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.location.href = '#about')}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>About</span>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.location.href = '#projects')}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <FolderKanban className="w-4 h-4" />
                                            <span>Projects</span>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.location.href = '#skills')}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Wrench className="w-4 h-4" />
                                            <span>Skills</span>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.location.href = '#contact')}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Mail className="w-4 h-4" />
                                            <span>Contact</span>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                            <span>Scroll to top</span>
                                        </Command.Item>
                                    </Command.Group>

                                    <Command.Group heading="Utilities" className="text-xs text-gray-500 font-medium mb-2 px-2 mt-2">
                                        <Command.Item
                                            onSelect={() => runCommand(() => copyToClipboard('vegadarsiwork@gmail.com', 'Email'), false)}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Copy className="w-4 h-4" />
                                            <span>Copy email</span>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => runCommand(() => copyToClipboard(window.location.href, 'Page URL'), false)}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Link className="w-4 h-4" />
                                            <span>Copy current URL</span>
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
                                        <Command.Item
                                            onSelect={() => runCommand(() => window.open('https://www.linkedin.com/in/vega-darsi/', '_blank'))}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                            <span>LinkedIn</span>
                                        </Command.Item>
                                    </Command.Group>

                                    <Command.Group heading="Mini Games" className="text-xs text-gray-500 font-medium mb-1 px-2 mt-2">
                                        <Command.Item
                                            onSelect={() => runCommand(coinFlip)}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Coins className="w-4 h-4" />
                                            <span>Flip a coin</span>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => runCommand(rollDice)}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Dice5 className="w-4 h-4" />
                                            <span>Roll a D20</span>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => runCommand(magicAnswer)}
                                            className="mb-1 flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                                        >
                                            <Gamepad2 className="w-4 h-4" />
                                            <span>Ask the 8-ball</span>
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
