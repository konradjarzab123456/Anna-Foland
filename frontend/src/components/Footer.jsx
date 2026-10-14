import { Link } from "react-router-dom";
import { Facebook, Instagram, CalendarCheck } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { useSite } from "@/context/SiteContext";
import Reveal from "@/components/Reveal";

const TABS = [
  { id: "o-mnie", label: "O mnie", path: "/o-mnie" },
  { id: "zawodnik", label: "Zawodnik", path: "/oferta/zawodnik-indywidualny" },
  { id: "klub", label: "Klub i Sztab", path: "/oferta/klub-i-sztab" },
  { id: "camps", label: "Camps", path: "/oferta/obozy-i-zgrupowania" },
  { id: "dzieci", label: "Dzieci i Młodzież", path: "/oferta/dzieci-i-mlodziezy" },
  { id: "aktywni", label: "Aktywni", path: "/oferta/dla-osob-aktywnych" },
  { id: "kontakt", label: "Kontakt", path: "/kontakt" },
];

export default function Footer() {
  const { content } = useSite();
  const c = content.contact;
  return (
    <footer className="bg-dark text-paper" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <Reveal>
          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-4">
                <LogoMark className="h-14 w-14" />
                <span>
                  <span
                    className="block whitespace-nowrap text-4xl leading-tight text-paper"
                    style={{ fontFamily: "'Sacramento', cursive" }}
                  >
                    {content.siteName}
                  </span>
                  <span className="mt-1 block text-sm font-semibold tracking-wide text-paper">
                    {(content.siteSuffix || "").charAt(0).toUpperCase() + (content.siteSuffix || "").slice(1)}
                  </span>
                  <span className="mt-0.5 block text-[9px] uppercase tracking-[0.3em] text-paper/60">
                    {content.tagline}
                  </span>
                </span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={c.facebook || "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  data-testid="footer-facebook-link"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-gold hover:text-gold"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href={c.instagram || "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  data-testid="footer-instagram-link"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-gold hover:text-gold"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href={c.booksy || "#"}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="footer-booksy-link"
                  className="inline-flex items-center gap-2 rounded-full border border-paper/20 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-paper/70 transition-colors hover:border-gold hover:text-gold"
                >
                  <CalendarCheck size={14} /> Zapis przez Booksy
                </a>
              </div>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3">
              {TABS.map((t) => (
                <Link
                  key={t.id}
                  to={t.path}
                  data-testid={`footer-link-${t.id}`}
                  className="link-underline font-mono text-xs uppercase tracking-[0.2em] text-paper/70 hover:text-paper"
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>
        </Reveal>

        <div className="mt-16 border-t border-paper/10 pt-8 text-sm text-paper/60">
          <a href={`mailto:${c.email || ""}`} data-testid="footer-email-link" className="link-underline">
            {c.email}
          </a>
        </div>

        <p className="mt-8 text-xs text-paper/40" data-testid="footer-note">{content.footer.note}</p>
      </div>
    </footer>
  );
}
