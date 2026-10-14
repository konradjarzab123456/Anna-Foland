import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import { useSite } from "@/context/SiteContext";

export default function ServicePage() {
  const { slug } = useParams();
  const { content } = useSite();
  const s = content.offer.services.find((x) => x.slug === slug);

  if (!s) {
    return (
      <main>
        <PageHeader eyebrow="Oferta" title="Nie znaleziono takiej zakładki." />
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <Link to="/oferta" className="link-underline font-mono text-xs uppercase tracking-[0.18em] text-ink" data-testid="service-back-link">
            Wróć do oferty
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHeader eyebrow={s.tab} title={s.title} subtitle={s.desc} />

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-12" data-testid="service-items">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-graphite">Co obejmuje współpraca</p>
        </Reveal>
        <div className="mt-10">
          {s.items.map((it, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="flex gap-6 border-b border-hairline py-8 first:border-t sm:gap-10" data-testid={`service-item-${i}`}>
                <span className="pt-1 font-mono text-xs text-gold">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-lg leading-relaxed text-graphite">
                  <span className="font-medium text-ink">{it.title}</span> — {it.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-16 flex flex-col items-start justify-between gap-8 border border-hairline bg-white p-10 sm:flex-row sm:items-center sm:p-12" data-testid="service-cta">
            <div>
              <h2 className="font-display text-3xl font-light text-ink sm:text-4xl">Porozmawiajmy o współpracy.</h2>
              <p className="mt-3 max-w-md text-graphite">Umów bezpłatną konsultację — dopasujemy formę wsparcia do Twoich potrzeb.</p>
            </div>
            <a
              href={content.contact.booksy || "https://annafoland.booksy.com"}
              target="_blank"
              rel="noreferrer"
              data-testid="service-cta-button"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.18em] text-paper transition-colors hover:bg-[#1F2937]"
            >
              Umów konsultację
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
