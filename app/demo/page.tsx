'use client';
import dynamic from 'next/dynamic';
import FloatingNav from '@/components/ui/FloatingNav';
import Footer from '@/components/ui/Footer';
import CommandMenu from '@/components/ui/CommandMenu';
import Spotify from '@/components/ui/Spotify';
import SectionReveal from '@/components/ui/SectionReveal';

const Hero = dynamic(() => import('@/components/ui/hero-ascii-one'), { ssr: false });
import ProjectsGrid from '@/components/ui/ProjectsGrid';
import Skills from '@/components/ui/Skills';
import Contact from '@/components/ui/Contact';
import About from '@/components/ui/About';

export default function DemoPage() {
  return (
    <div className="relative bg-black">
      <FloatingNav />
      <CommandMenu />
      <Spotify />

      <Hero />

      <div className="relative z-10">
        <About />
        <ProjectsGrid />
        <Skills />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}
