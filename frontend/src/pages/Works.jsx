import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Reveal, { EASE } from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import { useSite } from "@/context/SiteContext";

const norm = (s) => s.toLowerCase().replace(/[^a-ząćęłńóśźż]+/g, "-").replace(/^-|-$/g, "");

export default function Works() {
  const { content } = useSite();
  const w = content.works;
  const [filter, setFilter] = useState("Wszystkie");
  const [selected, setSelected] = useState(null);

  const categories = useMemo(() => ["Wszystkie", ...Array.from(new Set(w.items.map((i) => i.category)))], [w.items]);
  const items = useMemo(
    () => (filter === "Wszystkie" ? w.items : w.items.filter((i) => i.category === filter)),
    [w.items, filter]
  );

  return (
    <main>
      <PageHeader eyebrow={w.eyebrow} title={w.title} subtitle={w.subtitle} />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-12">
        <Reveal>
          <div className="flex flex-wrap gap-3" data-testid="project-filters">
            {categories.map((c) => (
              <button
                key={c}
                data-testid={`project-filter-${c === "Wszystkie" ? "all" : norm(c)}`}
                onClick={() => setFilter(c)}
                className={`rounded-full border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all duration-300 ${
                  filter === c
                    ? "border-ink bg-ink text-paper"
                    : "border-hairline bg-transparent text-graphite hover:border-ink hover:text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2" data-testid="projects-grid">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.button
                key={item.title}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                onClick={() => setSelected(item)}
                data-testid={`project-card-item-${norm(item.title)}`}
                className={`group block text-left ${i % 3 === 0 ? "md:col-span-2" : ""}`}
              >
                <div className={`overflow-hidden rounded-sm ${i % 3 === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                  <img src={item.image} alt={item.title} loading="lazy" className="img-treat h-full w-full object-cover" />
                </div>
                <div className="mt-5 flex items-baseline justify-between border-t border-hairline pt-4">
                  <div>
                    <h3 className="font-display text-2xl font-light text-ink sm:text-3xl">{item.title}</h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">
                      {item.category} · {item.location}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-steel">{item.year}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setSelected(null)}
            data-testid="project-modal-overlay"
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.45, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-paper shadow-2xl"
              data-testid="project-modal"
            >
              <div className="relative">
                <img src={selected.image} alt={selected.title} className="aspect-[16/8] w-full object-cover" />
                <button
                  data-testid="project-modal-close"
                  onClick={() => setSelected(null)}
                  aria-label="Zamknij"
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 text-ink transition-transform hover:scale-110"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-8 sm:p-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">
                  {selected.category} · {selected.year} · {selected.location}
                </p>
                <h3 className="mt-3 font-display text-3xl font-light tracking-tight text-ink sm:text-4xl">{selected.title}</h3>
                <p className="mt-5 leading-relaxed text-graphite">{selected.desc}</p>
                <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-hairline bg-hairline text-sm">
                  <div className="bg-white p-5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Kategoria</dt>
                    <dd className="mt-2 text-ink">{selected.category}</dd>
                  </div>
                  <div className="bg-white p-5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Rok</dt>
                    <dd className="mt-2 text-ink">{selected.year}</dd>
                  </div>
                  <div className="bg-white p-5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Lokalizacja</dt>
                    <dd className="mt-2 text-ink">{selected.location}</dd>
                  </div>
                  <div className="bg-white p-5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">Status</dt>
                    <dd className="mt-2 text-ink">Zrealizowany</dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
