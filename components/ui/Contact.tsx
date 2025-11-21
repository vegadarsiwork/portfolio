import { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

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

        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-3">
          {submitted ? (
            <div className="w-full p-8 bg-[#0b0b0b] border border-accent-1/20 rounded flex flex-col items-center justify-center text-center h-[300px]">
              <div className="text-accent-1 text-4xl mb-4">✓</div>
              <h3 className="text-white font-bold text-xl mb-2">Message Sent!</h3>
              <p className="text-gray-400">Thanks for reaching out. I'll get back to you soon.</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-gray-500 hover:text-white underline">Send another</button>
            </div>
          ) : (
            <>
              <input className="w-full p-3 bg-[#0b0b0b] border border-white/5 rounded focus:border-accent-1/50 outline-none transition-colors" placeholder="Your name" required />
              <input className="w-full p-3 bg-[#0b0b0b] border border-white/5 rounded focus:border-accent-1/50 outline-none transition-colors" placeholder="you@example.com" type="email" required />
              <textarea className="w-full p-3 bg-[#0b0b0b] border border-white/5 rounded focus:border-accent-1/50 outline-none transition-colors" placeholder="message" rows={6} required></textarea>
              <div><button className="px-4 py-2 bg-gradient-to-r from-accent-1 to-accent-2 text-black rounded font-medium hover:opacity-90 transition-opacity">send message</button></div>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
