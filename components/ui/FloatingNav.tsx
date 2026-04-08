'use client';
import { useEffect, useState } from 'react';
import { FolderKanban, Wrench, Mail, User } from 'lucide-react';

const navItems = [
  {
    title: 'about',
    icon: <User className='h-4 w-4 text-neutral-300' />,
    href: '#about',
  },
  {
    title: 'projects',
    icon: <FolderKanban className='h-4 w-4 text-neutral-300' />,
    href: '#projects',
  },
  {
    title: 'skills',
    icon: <Wrench className='h-4 w-4 text-neutral-300' />,
    href: '#skills',
  },
  {
    title: 'contact',
    icon: <Mail className='h-4 w-4 text-neutral-300' />,
    href: '#contact',
  },
];

export default function FloatingNav() {
  const [istTime, setIstTime] = useState('');

  useEffect(() => {
    const formatIst = () => {
      const time = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }).format(new Date());

      setIstTime(time);
    };

    formatIst();
    const intervalId = setInterval(formatIst, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <a
            href="#about"
            aria-label="Open about section"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 font-monoHead text-[11px] text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            VD
          </a>
          <div className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60 sm:block">
            IST {istTime || '--:--'}
          </div>
        </div>

        <nav className="flex items-center gap-2 text-sm text-gray-300 sm:gap-4 md:gap-6">
          {navItems.map((item) => (
            <a
              key={item.title}
              href={item.href}
              aria-label={item.title}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 transition-colors hover:bg-white/10 hover:text-white sm:rounded-none sm:border-none sm:bg-transparent sm:px-0 sm:py-0"
            >
              {item.icon}
              <span className="hidden sm:inline">{item.title}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
