export default function SiteHeader() {
  return (
    <header className="fixed w-full z-50 bg-bg/80 backdrop-blur-sm border-b border-white/5">
      <div className="container mx-auto flex items-center justify-between py-5 px-4">
        <div className="font-monoHead text-white text-lg">VEGA</div>
        <nav className="text-sm text-gray-300 hidden md:flex gap-4">
          <a href="#projects">projects</a>
          <a href="#skills">skills</a>
          <a href="#contact">contact</a>
        </nav>
      </div>
    </header>
  )
}
