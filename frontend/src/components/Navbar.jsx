import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useSite } from "@/context/SiteContext";
import { EASE } from "@/components/Reveal";

const TABS = [
  { id: "start", label: "Start", path: "/" },
  { id: "o-mnie", label: "O mnie", path: "/o-mnie" },
  { id: "zawodnik", label: "Dla Zawodnika", full: "Dla Zawodnika Indywidualnego", path: "/oferta/zawodnik-indywidualny" },
  { id: "klub", label: "Dla Klubu i Sztabu", full: "Dla Klubu, Drużyny i Sztabu Szkoleniowego", path: "/oferta/klub-i-sztab" },
  { id: "camps", label: "Obozy (Camps)", full: "Na Obozy i Zgrupowania Sportowe (Camps)", path: "/oferta/obozy-i-zgrupowania" },
  { id: "aktywni", label: "Dla Aktywnych", full: "Dla Osób Aktywnych", path: "/oferta/dla-osob-aktywnych" },
  { id: "kontakt", label: "Kontakt", path: "/kontakt" },
];

export default function Navbar() {
  const { content } = useSite();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-6 lg:px-10">
        <Link to="/" data-testid="nav-logo-link" aria-label="Strona główna">
          <Logo content={content} />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
          {TABS.map((t) => (
            <NavLink
              key={t.id}
              to={t.path}
              data-testid={`nav-link-${t.id}`}
              className={`link-underline whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                isActive(t.path) ? "is-active text-ink" : "text-graphite hover:text-ink"
              }`}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={content.contact.booksy || "https://annafoland.booksy.com"}
            target="_blank"
            rel="noreferrer"
            data-testid="cta-consultation-btn"
            className="group hidden items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-paper transition-colors hover:bg-[#1F2937] sm:inline-flex"
          >
            Umów konsultację
            <span className="h-1.5 w-1.5 rounded-full bg-gold transition-transform duration-300 group-hover:scale-[1.8]" />
          </a>
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
                transition={{ delay: 0.04 * i, duration: 0.35, ease: EASE }}
              >
                <Link
                  to={t.path}
                  data-testid={`nav-mobile-link-${t.id}`}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-hairline py-4 font-display font-light text-ink last:border-0 ${t.full ? "text-2xl" : "text-3xl"}`}
                >
                  {t.full || t.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

