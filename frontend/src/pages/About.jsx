import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import TiltImage from "@/components/TiltImage";
import { useSite } from "@/context/SiteContext";

export default function About() {
  const { content } = useSite();
  const a = content.about;

  return (
    <main>
      <PageHeader eyebrow={a.eyebrow} title={a.title} />

      {/* Story */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <TiltImage src={a.image} alt="Anna Foland — psycholog sportu" className="aspect-[3/4] rounded-br-[80px]" parallax />
              <div className="mt-4 border-t border-hairline pt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-steel">Fig. 02</span>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:pt-8">
            {a.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <p className={`leading-relaxed text-graphite ${i === 0 ? "text-xl sm:text-2xl text-ink" : "mt-8 text-base sm:text-lg"}`} data-testid={`about-paragraph-${i}`}>
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

