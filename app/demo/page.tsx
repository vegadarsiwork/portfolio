'use client';
import dynamic from 'next/dynamic';
import FloatingNav from '@/components/ui/FloatingNav';
import Footer from '@/components/ui/Footer';
const Hero = dynamic(() => import('@/components/ui/hero-ascii-one'), { ssr: false });
const ProjectsGrid = dynamic(() => import('@/components/ui/ProjectsGrid'), { ssr: false });
const Skills = dynamic(() => import('@/components/ui/Skills'), { ssr: false });
const Contact = dynamic(() => import('@/components/ui/Contact'), { ssr: false });

export default function DemoPage() {
  return (
    <div className="relative bg-black">
      <FloatingNav />
      <Hero />
      <div className="relative z-10">
        <ProjectsGrid />
        <Skills />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}
