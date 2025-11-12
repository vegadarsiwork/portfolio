'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import { FolderKanban, Wrench, Mail } from 'lucide-react';

const navItems = [
  {
    title: 'projects',
    icon: <FolderKanban className='h-full w-full text-neutral-300' />,
    href: '#projects',
  },
  {
    title: 'skills',
    icon: <Wrench className='h-full w-full text-neutral-300' />,
    href: '#skills',
  },
  {
    title: 'contact',
    icon: <Mail className='h-full w-full text-neutral-300' />,
    href: '#contact',
  },
];

export default function FloatingNav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Navbar - visible when not scrolled */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.header
            initial={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-sm border-b border-white/5"
          >
            <div className="container mx-auto flex items-center justify-between py-5 px-4">
              <div className="font-monoHead text-white text-lg">VEGA</div>
              <nav className="text-sm text-gray-300 flex gap-6">
                {navItems.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Floating Dock - visible when scrolled */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <Dock className="items-end pb-3 bg-[#070707]/95 backdrop-blur-md border border-white/10">
              <DockItem className="aspect-square rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <DockLabel>home</DockLabel>
                <DockIcon>
                  <a href="#" className="w-full h-full flex items-center justify-center">
                    <div className="font-monoHead text-white text-sm">V</div>
                  </a>
                </DockIcon>
              </DockItem>
              {navItems.map((item, idx) => (
                <DockItem
                  key={idx}
                  className="aspect-square rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <DockLabel>{item.title}</DockLabel>
                  <DockIcon>
                    <a href={item.href} className="w-full h-full flex items-center justify-center">
                      {item.icon}
                    </a>
                  </DockIcon>
                </DockItem>
              ))}
            </Dock>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
