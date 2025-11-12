export default function Contact() {
  return (
    <section id="contact" className="py-12 bg-black">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-monoHead text-2xl mb-4">contact</h2>
          <p className="text-gray-300 mb-4">I'm open for collaborations, freelance work, and internships. Reach out and let's build something.</p>
          <div className="text-sm text-gray-300">
            <div className="mb-2">Email: <a className="underline" href="mailto:vegadarsiwork@gmail.com">vegadarsiwork@gmail.com</a></div>
            <div>GitHub: <a className="underline" href="https://github.com/vegadarsiwork" target="_blank" rel="noreferrer">github.com/vegadarsiwork</a></div>
            <div>LinkedIn: <a className="underline" href="https://www.linkedin.com/in/vega-darsi/" target="_blank" rel="noreferrer">linkedin.com/in/vega-darsi</a></div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert('Form submitted — wire backend later'); }} className="space-y-3">
          <input className="w-full p-3 bg-[#0b0b0b] border border-white/5 rounded" placeholder="Your name" />
          <input className="w-full p-3 bg-[#0b0b0b] border border-white/5 rounded" placeholder="you@example.com" />
          <textarea className="w-full p-3 bg-[#0b0b0b] border border-white/5 rounded" placeholder="message" rows={6}></textarea>
          <div><button className="px-4 py-2 bg-gradient-to-r from-accent-1 to-accent-2 text-black rounded">send message</button></div>
        </form>
      </div>
    </section>
  )
}
