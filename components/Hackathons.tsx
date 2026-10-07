import Section from './Section';
import PixelReveal from './PixelReveal';
import { hackathons } from '@/data/hackathons';

const isWin = (result: string) => /1st|winner/i.test(result);

export default function Hackathons() {
  return (
    <Section
      id="hackathons"
      index="05"
      label="Hackathons"
      title="THINGS I RAN AT 3AM."
      intro="A running log of hackathons and ML experiments - some won, most didn't, all taught me something I couldn't have learned from a tutorial."
    >
      <ul>
        {hackathons.map((h) => (
          <li key={h.title + h.year}>
            <PixelReveal>
              <div className="border-t border-[var(--color-v2-muted)]/20 py-5 grid grid-cols-[56px_1fr] md:grid-cols-[72px_1fr_auto] gap-x-4 md:gap-x-8 gap-y-2">
                <span className="meta tabular-nums pt-[5px]">{h.year}</span>

                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-medium text-[var(--color-v2-text)]">{h.title}</h3>
                    <span className="text-sm text-[var(--color-v2-muted)]">{h.event}</span>
                  </div>
                  <p className="mt-1 text-sm md:text-[15px] leading-relaxed text-[var(--color-v2-text)]/70 max-w-2xl">
                    {h.summary}
                  </p>
                  <p className="meta mt-2">{h.stack.join(' / ')}</p>
                </div>

                <div className="col-start-2 md:col-start-auto flex md:flex-col items-baseline md:items-end gap-x-4 gap-y-2 md:pt-[5px]">
                  <span className={`meta ${isWin(h.result) ? 'text-[var(--color-v2-orange)]' : ''}`}>{h.result}</span>
                  <span className="flex gap-4 text-sm">
                    {h.demo && (
                      <a href={h.demo} target="_blank" rel="noreferrer" className="link">
                        Live
                      </a>
                    )}
                    {h.repo && (
                      <a href={h.repo} target="_blank" rel="noreferrer" className="link">
                        Code
                      </a>
                    )}
                  </span>
                </div>
              </div>
            </PixelReveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
