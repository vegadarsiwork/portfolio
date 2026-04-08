import { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-black" />
      
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="font-monoHead text-3xl md:text-4xl text-white mb-4">get in touch</h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            I'm always open to new opportunities and collaborations. Let's create something amazing together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="flex flex-col justify-center">
            <p className="text-gray-300 mb-6">Reach out through any of these channels:</p>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                Email:{' '}
                <a className="text-accent-1 hover:text-accent-2 transition-colors underline" href="mailto:vegadarsiwork@gmail.com">
                  vegadarsiwork@gmail.com
                </a>
              </div>
              <div>
                GitHub:{' '}
                <a className="text-accent-1 hover:text-accent-2 transition-colors underline" href="https://github.com/vegadarsiwork" target="_blank" rel="noreferrer">
                  github.com/vegadarsiwork
                </a>
              </div>
              <div>
                LinkedIn:{' '}
                <a className="text-accent-1 hover:text-accent-2 transition-colors underline" href="https://www.linkedin.com/in/vega-darsi/" target="_blank" rel="noreferrer">
                  linkedin.com/in/vega-darsi
                </a>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-3">
            {submitted ? (
              <div className="w-full p-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-accent-1/20 rounded-2xl flex flex-col items-center justify-center text-center h-[300px]">
                <div className="text-accent-1 text-4xl mb-4">✓</div>
                <h3 className="text-white font-bold text-xl mb-2">Message Sent!</h3>
                <p className="text-gray-400">Thanks for reaching out. I'll get back to you soon.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-gray-500 hover:text-white underline transition-colors">
                  Send another
                </button>
              </div>
            ) : (
              <>
                <input 
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent-1/50 outline-none transition-colors placeholder-gray-500" 
                  placeholder="Your name" 
                  required 
                />
                <input 
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent-1/50 outline-none transition-colors placeholder-gray-500" 
                  placeholder="you@example.com" 
                  type="email" 
                  required 
                />
                <textarea 
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent-1/50 outline-none transition-colors resize-none placeholder-gray-500" 
                  placeholder="Your message..." 
                  rows={6} 
                  required
                />
                <div>
                  <button className="px-6 py-3 bg-gradient-to-r from-accent-1 to-accent-2 text-black rounded-lg font-medium hover:opacity-90 transition-opacity">
                    send message
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
