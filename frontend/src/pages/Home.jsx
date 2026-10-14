import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import Reveal, { MaskedLines, EASE } from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import TiltImage from "@/components/TiltImage";
import { useSite } from "@/context/SiteContext";
import api, { formatApiError } from "@/lib/api";

export default function Home() {
  const { content } = useSite();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success("Wiadomość wysłana. Odezwiemy się w ciągu 24 godzin.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSending(false);
    }
  };

  const featured = content.works.items.slice(0, 3);

  return (
    <main>
      {/* HERO */}
      <section className="relative" data-testid="hero-section">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-14 sm:pt-20 lg:grid-cols-12 lg:gap-8 lg:px-12 lg:pb-24 lg:pt-24">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="font-mono text-xs uppercase tracking-[0.25em] text-graphite"
              data-testid="hero-eyebrow"
            >
              {content.hero.eyebrow}
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
              className="mt-6 h-px w-24 origin-left bg-gold"
              data-testid="hero-rule"
            />

            <MaskedLines
              lines={content.hero.lines}
              className="mt-8 font-display text-[clamp(2.6rem,7.5vw,5.4rem)] font-light leading-[1.02] tracking-tight text-ink"
              delay={0.35}
            />

            <Reveal delay={1.15} y={18}>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-graphite sm:text-lg" data-testid="hero-subtitle">
                {content.hero.subtitle}
              </p>
            </Reveal>

            <Reveal delay={1.3} y={18}>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  to="/kontakt"
                  data-testid="hero-cta-primary"
                  className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.18em] text-paper transition-colors hover:bg-[#1F2937]"
                >
                  {content.hero.ctaPrimary}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/o-firmie"
                  data-testid="hero-cta-secondary"
                  className="link-underline font-mono text-xs uppercase tracking-[0.18em] text-ink"
                >
                  {content.hero.ctaSecondary}
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
            >
              <TiltImage
                src={content.hero.image}
                alt="Budynek realizowany przez studio"
                className="aspect-[3/4] rounded-br-[80px] lg:mt-4"
                parallax
                eager
              />
              <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-steel">
                  Fig. 01
                </span>
                <span className="font-mono text-[10px] text-steel">© {content.siteName}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats band */}
        <div className="border-y border-hairline">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-12">
            {content.stats.map((s, i) => (
              <Reveal key={i} delay={i * 0.12} className="px-6 py-10 lg:px-8">
                <p className="font-display text-5xl font-light text-ink" data-testid={`stat-value-${i}`}>
                  {s.value}
                </p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Marquee items={content.marquee} />

      {/* Bio */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12" data-testid="home-bio">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-2">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-graphite">Kim jestem</p>
          </Reveal>
          <div className="lg:col-span-10">
            <Reveal delay={0.1}>
              <p className="max-w-4xl font-display text-2xl font-light leading-[1.3] text-ink sm:text-4xl" data-testid="statement-text">
                {content.about.paragraphs[1] || ""}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-10 max-w-3xl text-lg italic leading-relaxed text-graphite" data-testid="bio-quote">
                {content.about.paragraphs[2] || ""}
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mt-10 max-w-3xl leading-relaxed text-graphite">
                {content.about.paragraphs[3] || ""}
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <p className="mt-6 max-w-3xl leading-relaxed text-graphite">
                {content.about.paragraphs[4] || ""}
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <Link
                to="/o-firmie"
                data-testid="statement-about-link"
                className="mt-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-ink"
              >
                Więcej o mnie <ArrowUpRight size={14} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured works */}
      <section className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32 lg:px-12" data-testid="featured-works">
        <Reveal>
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-display text-3xl font-light tracking-tight sm:text-5xl">Wybrane realizacje</h2>
            <Link to="/realizacje" data-testid="featured-works-all" className="link-underline hidden font-mono text-xs uppercase tracking-[0.18em] text-graphite sm:block">
              Wszystkie projekty
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-2">
          {featured.map((w, i) => (
            <Reveal key={i} delay={i * 0.12} className={i === 0 ? "md:col-span-2" : ""}>
              <Link to="/realizacje" className="group block" data-testid={`project-card-item-${i}`}>
                <div className={`overflow-hidden ${i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"} rounded-sm`}>
                  <img src={w.image} alt={w.title} loading="lazy" className="img-treat h-full w-full object-cover" />
                </div>
                <div className="mt-5 flex items-baseline justify-between border-t border-hairline pt-4">
                  <div>
                    <h3 className="font-display text-2xl font-light text-ink">{w.title}</h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">
                      {w.category} · {w.location}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-steel">{w.year}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Scopes */}
      <section className="border-t border-hairline bg-subtle/60">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12">
          <Reveal>
            <h2 className="font-display text-3xl font-light tracking-tight sm:text-5xl">Nasze zakresy</h2>
          </Reveal>
          <div className="mt-12">
            {content.offer.services.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <Link
                  to="/oferta"
                  data-testid={`service-row-${i}`}
                  className="service-row group flex items-baseline justify-between border-b border-hairline py-8 first:border-t"
                >
                  <div className="flex items-baseline gap-8">
                    <span className="font-mono text-xs text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="font-display text-2xl font-light text-ink sm:text-3xl">{s.title}</h3>
                  </div>
                  <ArrowUpRight size={20} className="shrink-0 text-steel transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">Certyfikaty i nagrody</h2>
          </Reveal>
          <div>
            {content.about.awards.map((a, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <p className="flex items-center gap-4 border-b border-hairline py-5 text-graphite" data-testid={`award-item-${i}`}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {a}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quick contact */}
      <section className="border-t border-hairline">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 sm:py-32 lg:grid-cols-2 lg:px-12">
          <div>
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-graphite">Szybki kontakt</p>
              <h2 className="mt-6 font-display text-3xl font-light leading-tight tracking-tight sm:text-5xl">
                Opowiedz nam o swojej inwestycji.
              </h2>
              <p className="mt-6 max-w-md text-graphite">
                Odpowiadamy w ciągu 24 godzin roboczych. Pełny formularz znajdziesz w zakładce{" "}
                <Link to="/kontakt" className="link-underline text-ink" data-testid="quick-contact-full-link">
                  Kontakt
                </Link>
                .
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <form onSubmit={submit} className="space-y-5" data-testid="quick-contact-form">
              <input
                data-testid="contact-name-input"
                required
                placeholder="Imię i nazwisko"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-b border-hairline bg-transparent py-4 text-ink outline-none transition-colors placeholder:text-steel focus:border-ink"
              />
              <input
                data-testid="contact-email-input"
                required
                type="email"
                placeholder="Adres e-mail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border-b border-hairline bg-transparent py-4 text-ink outline-none transition-colors placeholder:text-steel focus:border-ink"
              />
              <textarea
                data-testid="contact-message-input"
                required
                rows={4}
                placeholder="Wiadomość"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full resize-none border-b border-hairline bg-transparent py-4 text-ink outline-none transition-colors placeholder:text-steel focus:border-ink"
              />
              <button
                data-testid="contact-submit-button"
                disabled={sending}
                className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.18em] text-paper transition-colors hover:bg-[#1F2937] disabled:opacity-50"
              >
                {sending ? "Wysyłanie…" : "Wyślij wiadomość"}
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
