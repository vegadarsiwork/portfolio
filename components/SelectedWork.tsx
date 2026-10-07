import { chapters } from '@/data/chapters';
import ProjectChapter, { ProjectRow } from './ProjectChapter';
import PixelReveal from './PixelReveal';
import Section from './Section';

export default function SelectedWork() {
  const featured = chapters.filter((c) => c.featured);
  const rest = chapters.filter((c) => !c.featured);

  return (
    <Section
      id="work"
      index="02"
      label="Selected work"
      title="THINGS I MADE WHILE FIGURING IT OUT."
      intro="Projects I actually shipped — plus the one I'm building now. Short notes on what each one is, not a grid of screenshots."
    >
      {featured.map((chapter, i) => (
        <ProjectChapter key={chapter.title} chapter={chapter} index={i} />
      ))}

      {rest.length > 0 && (
        <div className="mt-4 md:mt-8">
          <PixelReveal>
            <p className="meta mb-4">Also shipped</p>
          </PixelReveal>
          {rest.map((chapter) => (
            <ProjectRow key={chapter.title} chapter={chapter} />
          ))}
        </div>
      )}
    </Section>
  );
}
