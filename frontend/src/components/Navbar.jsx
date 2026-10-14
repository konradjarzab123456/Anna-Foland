import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useSite } from "@/context/SiteContext";
import { EASE } from "@/components/Reveal";

const TABS = [
  { id: "start", label: "Start", path: "/" },
  { id: "o-firmie", label: "O firmie", path: "/o-firmie" },
  { id: "oferta", label: "Oferta", path: "/oferta" },
  { id: "realizacje", label: "Realizacje", path: "/realizacje" },
  { id: "kontakt", label: "Kontakt", path: "/kontakt" },
];

export default function Navbar() {
  const { content } = useSite();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link to="/" data-testid="nav-logo-link" aria-label="Strona główna">
          <Logo content={content} />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {TABS.map((t) => (
            <div key={t.id} className="relative group">
              <NavLink
                to={t.path}
                data-testid={`nav-link-${t.id}`}
                className={`link-underline font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                  isActive(t.path) ? "is-active text-ink" : "text-graphite hover:text-ink"
                }`}
              >
                {t.label}
              </NavLink>
              {t.id === "oferta" && (
                <div
                  className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100"
                  data-testid="nav-oferta-dropdown"
                >
                  <div className="w-80 border border-hairline bg-white p-3 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)]">
                    {content.offer.services.map((s) => (
                      <Link
                        key={s.slug}
                        to={`/oferta/${s.slug}`}
                        data-testid={`nav-oferta-${s.slug}`}
                        className="block px-4 py-3 transition-colors hover:bg-subtle"
                      >
                        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-gold">{s.tab}</span>
                        <span className="mt-1 block font-display text-lg leading-tight text-ink">{s.title}</span>
                      </Link>
                    ))}
                    <Link
                      to="/oferta"
                      data-testid="nav-oferta-all"
                      className="mt-2 block border-t border-hairline px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-graphite transition-colors hover:text-ink"
                    >
                      Wszystkie usługi
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/kontakt"
            data-testid="cta-consultation-btn"
            className="group hidden items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-paper transition-colors hover:bg-[#1F2937] sm:inline-flex"
          >
            Umów konsultację
            <span className="h-1.5 w-1.5 rounded-full bg-gold transition-transform duration-300 group-hover:scale-[1.8]" />
          </Link>
          <button
            data-testid="nav-mobile-toggle"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="border-t border-hairline bg-paper px-6 py-6 lg:hidden"
            data-testid="nav-mobile-menu"
          >
            {TABS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35, ease: EASE }}
              >
                <Link
                  to={t.path}
                  data-testid={`nav-mobile-link-${t.id}`}
                  onClick={() => setOpen(false)}
                  className="block border-b border-hairline py-4 font-display text-3xl font-light text-ink last:border-0"
                >
                  {t.label}
                </Link>
                {t.id === "oferta" &&
                  content.offer.services.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/oferta/${s.slug}`}
                      data-testid={`nav-mobile-oferta-${s.slug}`}
                      onClick={() => setOpen(false)}
                      className="block border-b border-hairline py-2.5 pl-6 font-mono text-[11px] uppercase tracking-[0.18em] text-graphite"
                    >
                      — {s.tab}
                    </Link>
                  ))}
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
