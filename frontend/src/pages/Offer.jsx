import { useState } from "react";
import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import { useSite } from "@/context/SiteContext";

const RATES = {
  "Projekt mieszkania / domu": 450,
  "Budynek komercyjny": 380,
  "Użyteczność publiczna": 320,
};

export default function Offer() {
  const { content } = useSite();
  const o = content.offer;
  const [sqm, setSqm] = useState(120);
  const [type, setType] = useState(Object.keys(RATES)[0]);
  const result = (sqm || 0) * (RATES[type] ?? 0);

  return (
    <main>
      <PageHeader eyebrow={o.eyebrow} title={o.title} subtitle={o.subtitle} />

      {/* Services */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-12" data-testid="offer-services">
        {o.services.map((s, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="grid gap-8 border-b border-hairline py-14 first:border-t lg:grid-cols-12" data-testid={`offer-service-${i}`}>
              <div className="lg:col-span-2">
                <span className="font-display text-6xl font-light text-hairline">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="lg:col-span-5">
                <h2 className="font-display text-3xl font-light tracking-tight text-ink sm:text-4xl">{s.title}</h2>
                <p className="mt-4 max-w-md leading-relaxed text-graphite">{s.desc}</p>
              </div>
              <div className="lg:col-span-5">
                <ul className="space-y-3">
                  {(Array.isArray(s.items) ? s.items : []).map((it, j) => (
                    <li key={j} className="flex items-center gap-4 border-b border-hairline pb-3 text-sm text-graphite" data-testid={`offer-service-item-${i}-${j}`}>
                      <span className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Calculator */}
      <section className="border-t border-hairline bg-subtle/60">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 sm:py-28 lg:grid-cols-2 lg:px-12">
          <div>
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-graphite">Kalkulator</p>
              <h2 className="mt-6 font-display text-3xl font-light tracking-tight sm:text-5xl">
                Wstępna wycena projektu
              </h2>
              <p className="mt-6 max-w-md text-graphite">
                Wybierz typ inwestycji i podaj metraż — otrzymasz orientacyjny koszt opracowania projektu.
                Wycena nie stanowi oferty w rozumieniu Kodeksu cywilnego.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="card-lift border border-hairline bg-white p-8 sm:p-10" data-testid="calculator-card">
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">Metraż (m²)</span>
                <input
                  data-testid="calculator-sqm-input"
                  type="number"
                  min="10"
                  max="100000"
                  value={sqm}
                  onChange={(e) => setSqm(parseInt(e.target.value, 10) || 0)}
                  className="mt-3 w-full border-b border-hairline bg-transparent pb-3 font-display text-4xl font-light text-ink outline-none transition-colors focus:border-ink"
                />
              </label>
              <label className="mt-8 block">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">Typ inwestycji</span>
                <select
                  data-testid="calculator-type-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-3 w-full border-b border-hairline bg-transparent pb-3 text-lg text-ink outline-none transition-colors focus:border-ink"
                >
                  {Object.keys(RATES).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-10 border-t border-hairline pt-6" data-testid="calculator-result-display">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">Szacowany koszt projektu</span>
                <p className="mt-3 font-display text-4xl font-light text-ink sm:text-5xl">
                  ≈ {result.toLocaleString("pl-PL")} zł <span className="text-lg text-steel">netto</span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12">
        <Reveal>
          <h2 className="font-display text-3xl font-light tracking-tight sm:text-5xl">Proces współpracy</h2>
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {o.process.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="card-lift h-full bg-white p-10" data-testid={`process-step-${i}`}>
                <span className="font-mono text-xs text-gold">{p.step}</span>
                <h3 className="mt-5 font-display text-2xl font-light text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
