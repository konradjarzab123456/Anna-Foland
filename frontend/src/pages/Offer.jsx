import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import { useSite } from "@/context/SiteContext";

export default function Offer() {
  const { content } = useSite();
  const o = content.offer;

  return (
    <main>
      <PageHeader eyebrow={o.eyebrow} title={o.title} subtitle={o.subtitle} />

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-12" data-testid="offer-tabs">
        <div className="grid gap-px overflow-hidden border border-hairline bg-hairline md:grid-cols-2">
          {o.services.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <Link
                to={`/oferta/${s.slug}`}
                data-testid={`offer-tab-${s.slug}`}
                className="card-lift group flex h-full flex-col bg-white p-10 lg:p-12"
              >
                <span className="font-mono text-xs text-gold">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">{s.tab}</p>
                <h2 className="mt-3 font-display text-3xl font-light leading-tight text-ink">{s.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-graphite">{s.desc}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                  Zobacz zakładkę
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}

