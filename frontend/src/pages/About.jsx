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
              <TiltImage src={a.image} alt="Zespół studia" className="aspect-[3/4] rounded-br-[80px]" parallax />
              <div className="mt-4 border-t border-hairline pt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-steel">Fig. 02 — Pracownia</span>
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

            <Reveal delay={0.3}>
              <div className="mt-14 grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-3">
                {a.values.map((v, i) => (
                  <div key={i} className="card-lift bg-white p-8" data-testid={`about-value-card-${i}`}>
                    <span className="font-mono text-xs text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-4 font-display text-2xl font-light text-ink">{v.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-graphite">{v.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-hairline bg-subtle/60">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12">
          <Reveal>
            <h2 className="font-display text-3xl font-light tracking-tight sm:text-5xl">Zespół ekspertów</h2>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-3">
            {a.team.map((m, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="group bg-white p-10" data-testid={`team-card-${i}`}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink font-display text-2xl font-light text-paper transition-colors duration-500 group-hover:bg-gold group-hover:text-ink">
                    {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-light text-ink">{m.name}</h3>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">{m.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">Nagrody i publikacje</h2>
          </Reveal>
          <div>
            {a.awards.map((aw, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <p className="flex items-center gap-4 border-b border-hairline py-5 text-graphite" data-testid={`about-award-${i}`}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {aw}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
