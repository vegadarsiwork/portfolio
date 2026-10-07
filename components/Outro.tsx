import PixelReveal from './PixelReveal';
import PixelScene from './PixelScene';
import StaggerWords from './StaggerWords';

const links = [
  { label: 'Email',    value: 'hey@vega.fyi', href: 'mailto:hey@vega.fyi' },
  { label: 'GitHub',   value: 'github.com/vegadarsiwork', href: 'https://github.com/vegadarsiwork' },
  { label: 'LinkedIn', value: 'linkedin.com/in/vega-darsi', href: 'https://www.linkedin.com/in/vega-darsi/' },
  { label: 'Resume',   value: 'download (pdf)', href: '/Vega_Darsi_Resume.pdf' },
];

export default function Outro() {
  return (
    <section
      id="contact"
      className="relative min-h-screen flex flex-col justify-center px-5 md:px-12 pt-24 pb-[540px] min-[1200px]:pb-24"
    >
      {/* The page ends at the desk where all of it gets made. The scene reaches
          up into the gap above the section so its starfield has no top edge. */}
      <PixelScene view="desk" fps={12} className="-top-16 md:-top-28" />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <PixelReveal>
          <p className="meta mb-6">
            <span className="text-[var(--color-v2-orange)]">06</span> / Contact
          </p>
        </PixelReveal>

        {/* Big pixel CTA */}
        <h2 className="pxh-out px-glow text-[var(--color-v2-text)] mb-8">
          <StaggerWords as="span" stagger={0.12} className="block">
            LET&apos;S BUILD
          </StaggerWords>
          <StaggerWords as="span" stagger={0.12} delay={0.24} className="block text-[var(--color-v2-orange)]">
            SOMETHING.
          </StaggerWords>
        </h2>

        <PixelReveal delay={0.2}>
          <p className="px-outline text-base md:text-xl text-[var(--color-v2-text)]/90 max-w-xl mb-12">
            Internships, collaborations, hackathon teams, or just a long email about a weird idea -
            all welcome. I read everything.
          </p>
        </PixelReveal>

        {/* Contact links */}
        <PixelReveal delay={0.3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px max-w-xl bg-[var(--color-v2-muted)]/20 border border-[var(--color-v2-muted)]/20">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noreferrer"
                className="px-step group block bg-[var(--color-v2-bg)] p-4 md:p-5"
              >
                <div className="meta mb-2">{l.label}</div>
                <div className="px-step text-sm md:text-base text-[var(--color-v2-text)] group-hover:text-[var(--color-v2-orange)] break-all">
                  {l.value}
                </div>
              </a>
            ))}
          </div>
        </PixelReveal>

        {/* Footer signoff */}
        <p className="meta px-outline mt-12 md:mt-16">Vega Darsi / {new Date().getFullYear()}</p>
      </div>
    </section>
  );
}
